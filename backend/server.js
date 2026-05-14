const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const Message = require('./models/Message');
const Session = require('./models/Session');
const fs = require('fs');
const { exec } = require('child_process');


const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Seed admin user
const seedAdmin = async () => {
  try {
    const User = require('./models/User');
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@collabcode.com',
        password: 'admin123',
        role: 'admin',
        status: 'active'
      });
      
      await adminUser.save();
      console.log('✅ Admin user seeded:');
      console.log('   Email: admin@collabcode.com');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  }
};

seedAdmin();

const getSessionRemainingTime = (session) => {
  const durationSeconds = (session.timer?.duration || 60) * 60;
  if (!session.timer?.startedAt) {
    return durationSeconds;
  }
  const startedAt = new Date(session.timer.startedAt).getTime();
  const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
  return Math.max(0, durationSeconds - elapsedSeconds);
};

const expireSessions = async () => {
  try {
    console.log('🔍 Running expiry check at:', new Date().toISOString());
    const now = new Date();

    // Expire WAITING sessions if candidate didn't join in time
    const waitingResult = await Session.updateMany(
      {
        status: 'waiting',
        'timer.expiresAt': { $exists: true, $lte: now },
      },
      {
        $set: { status: 'completed' },
      }
    );
    console.log('✅ Expired waiting sessions:', waitingResult.modifiedCount);

    // Expire ACTIVE sessions when interview time ends
    const activeResult = await Session.updateMany(
      {
        status: 'active',
        'timer.endedAt': { $exists: true, $lte: now },
      },
      {
        $set: { status: 'completed' },
      }
    );
    console.log('✅ Expired active sessions:', activeResult.modifiedCount);

    // Handle legacy active sessions without endedAt
    const legacyActive = await Session.find({
      status: 'active',
      'timer.endedAt': { $exists: false },
      'timer.startedAt': { $exists: true },
    });

    console.log('🔍 Found legacy active sessions to fix:', legacyActive.length);

    for (const session of legacyActive) {
      const duration = session.timer?.duration || 60;
      const startedAt = new Date(session.timer.startedAt).getTime();
      const expiryTime = startedAt + duration * 60000;

      if (now.getTime() >= expiryTime) {
        await Session.updateOne(
          { _id: session._id },
          {
            $set: {
              status: 'completed',
              'timer.endedAt': new Date(expiryTime),
              endsAt: new Date(expiryTime)
            }
          },
          { runValidators: false }
        );
        console.log('✅ Completed legacy active session:', session.roomId);
      }
    }

    // Handle legacy waiting sessions without expiresAt
    const legacyWaiting = await Session.find({
      status: 'waiting',
      'timer.expiresAt': { $exists: false },
      createdAt: { $exists: true },
    });

    console.log('🔍 Found legacy waiting sessions to fix:', legacyWaiting.length);

    for (const session of legacyWaiting) {
      const duration = session.timer?.duration || 60;
      const createdTime = new Date(session.createdAt).getTime();
      const expiryTime = createdTime + duration * 60000;

      if (now.getTime() >= expiryTime) {
        await Session.updateOne(
          { _id: session._id },
          {
            $set: {
              status: 'completed',
              'timer.expiresAt': new Date(expiryTime)
            }
          },
          { runValidators: false }
        );
        console.log('✅ Completed legacy waiting session:', session.roomId);
      }
    }
  } catch (err) {
    console.error('❌ Error expiring sessions:', err);
  }
};

expireSessions();
setInterval(expireSessions, 5000); // TEMP: 5 seconds for testing

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Body parser
app.use(express.json());

// Enable cors
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/admin', require('./routes/admin'));

// Socket.io
const activeRooms = new Set();

io.on('connection', (socket) => {
  console.log('New client connected');

  // Join room
  socket.on('join_room', (roomId) => {
    if (!roomId) return;
    socket.join(roomId);
    activeRooms.add(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on('leave_room', (roomId) => {
    if (!roomId) return;
    socket.leave(roomId);
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room || room.size === 0) {
      activeRooms.delete(roomId);
    }
    console.log(`User left room: ${roomId}`);
  });

  // Code change
  socket.on('code_change', (data) => {
    socket.to(data.roomId).emit('code_update', data);
  });

  // Sync code
  socket.on('sync_code', (data) => {
    socket.to(data.roomId).emit('code_sync', data);
  });

  socket.on('join_session', async (roomId) => {
    try {
      const session = await Session.findOne({ roomId });
      if (session) {
        const sessionObj = session.toObject();
        sessionObj.timer = {
          ...sessionObj.timer,
          timeLeft: getSessionRemainingTime(session),
        };
        io.to(roomId).emit('session_updated', { ...sessionObj, roomId });
      }
    } catch (err) {
      console.error('Error on join_session:', err);
    }
  });

  // send message
  socket.on('send_message', async (data) => {
    try {
      const session = await Session.findOne({ roomId: data.roomId });
      if (!session) {
        console.error('Session not found for room:', data.roomId);
        return;
      }

      const newMessage = new Message({
        session: session._id,
        sender: data.sender,
        content: data.content,
      });

      await newMessage.save();

      // push message into session
      session.messages.push(newMessage._id);
      await session.save();

      // send to all users in the room, including sender
      io.to(data.roomId).emit('receive_message', {
        ...data,
        _id: newMessage._id,
        timestamp: newMessage.timestamp,
      });
    } catch (err) {
      console.error('Message error:', err);
    }
  });

  // Run code
  socket.on('run_code', ({ code, language, roomId }) => {
    try {
      let fileName, command;

      if (language === 'javascript') {
        fileName = `temp_${roomId}.js`;
        fs.writeFileSync(fileName, code);
        command = `node ${fileName}`;
      } else if (language === 'python') {
        fileName = `temp_${roomId}.py`;
        fs.writeFileSync(fileName, code);
        command = `python3 ${fileName}`;
      } else if (language === 'java') {
        fileName = `Main_${roomId}.java`;
        fs.writeFileSync(fileName, code);
        command = `javac ${fileName} && java Main`;
      } else {
        socket.emit('code_output', { error: 'Unsupported language' });
        return;
      }

      exec(command, { timeout: 5000 }, (err, stdout, stderr) => {
        // Clean up temp files
        try {
          if (language === 'javascript' || language === 'python') {
            fs.unlinkSync(fileName);
          } else if (language === 'java') {
            fs.unlinkSync(fileName);
            fs.unlinkSync('Main.class'); // Java creates .class file
          }
        } catch (cleanupErr) {
          console.error('Cleanup error:', cleanupErr);
        }

        if (err) {
          socket.emit('code_output', { error: stderr || err.message });
        } else {
          socket.emit('code_output', { output: stdout });
        }
      });
    } catch (err) {
      socket.emit('code_output', { error: 'Execution failed: ' + err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the process using it or set PORT to a different value.`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});