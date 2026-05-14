const { validationResult } = require('express-validator');
const Session = require('../models/Session');

const getSessionRemainingTime = (session) => {
  const durationSeconds = (session.timer?.duration || 60) * 60;
  if (!session.timer?.startedAt) {
    return durationSeconds;
  }

  const startedAt = new Date(session.timer.startedAt).getTime();
  const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
  return Math.max(0, durationSeconds - elapsedSeconds);
};

const expireSessionIfNeeded = async (session) => {
  if (!session.timer?.startedAt || session.status !== 'active') {
    return session;
  }

  const remainingSeconds = getSessionRemainingTime(session);
  if (remainingSeconds === 0) {
    session.status = 'completed';
    const startedAt = new Date(session.timer.startedAt).getTime();
    session.timer.endedAt = session.timer.endedAt || new Date(startedAt + (session.timer.duration || 60) * 60 * 1000);
    await Session.updateOne(
      { _id: session._id },
      {
        $set: {
          status: 'completed',
          'timer.endedAt': session.timer.endedAt
        }
      },
      { runValidators: false }
    );
    session.status = 'completed'; // Update local object
  }

  return session;
};

const createSession = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { problem, timer, candidateEmail } = req.body;

    if (!candidateEmail) {
      return res.status(400).json({ message: 'Candidate email is required' });
    }

    const roomId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const duration = timer?.duration || 60;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 60000);

    const session = new Session({
      roomId,
      interviewer: req.user.id,
      candidateEmail,
      problem,
      timer: {
        duration,
        expiresAt,
      },
    });

    await session.save();

    res.status(201).json(session);
  } catch (err) {
  console.error("FULL ERROR:", err); // ✅ shows full error
  res.status(500).json({ error: err.message }); // ✅ send real error
  }
};

const getSessions = async (req, res) => {
  try {
    console.log('🔍 getSessions called at:', new Date().toISOString());
    const now = new Date();

    // Expire waiting sessions if candidate didn't join in time
    const waitingResult = await Session.updateMany(
      {
        status: 'waiting',
        'timer.expiresAt': { $exists: true, $lte: now },
      },
      {
        $set: { status: 'completed' },
      }
    );
    console.log('✅ getSessions expired waiting:', waitingResult.modifiedCount);

    // Expire active sessions when interview ends
    const activeResult = await Session.updateMany(
      {
        status: 'active',
        'timer.endedAt': { $exists: true, $lte: now },
      },
      {
        $set: { status: 'completed' },
      }
    );
    console.log('✅ getSessions expired active:', activeResult.modifiedCount);

    // Handle legacy active sessions
    const legacyActive = await Session.find({
      status: 'active',
      'timer.endedAt': { $exists: false },
      'timer.startedAt': { $exists: true },
    });

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
      }
    }

    let query = {};

    if (req.user.role === 'candidate') {
      // Candidates see only sessions assigned to their email
      query = { candidateEmail: req.user.email };
    } else if (req.user.role === 'interviewer') {
      // Interviewers see sessions they created
      query = { interviewer: req.user.id };
    } else {
      // Fallback for other roles or if role is not set
      query = {
        $or: [{ interviewer: req.user.id }, { candidate: req.user.id }],
      };
    }

    const sessions = await Session.find(query)
      .populate('interviewer', 'name email')
      .populate('candidate', 'name email')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
  console.error("FULL ERROR:", err); // ✅ shows full error
  res.status(500).json({ error: err.message }); // ✅ send real error
}
};

const getSessionByRoomId = async (req, res) => {
  try {
    let session = await Session.findOne({ roomId: req.params.roomId })
      .populate('interviewer', 'name email')
      .populate('candidate', 'name email')
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          select: 'name email',
        },
      });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session = await expireSessionIfNeeded(session);

    const sessionObj = session.toObject();
    sessionObj.timer = {
      ...sessionObj.timer,
      timeLeft: getSessionRemainingTime(session),
    };

    if (
      session.interviewer._id.toString() !== req.user.id &&
      (!session.candidate || session.candidate._id.toString() !== req.user.id)
    ) {
      return res.status(403).json({ message: 'Not authorized to access this session' });
    }

    res.json(sessionObj);
  } catch (err) {
  console.error("FULL ERROR:", err); // ✅ shows full error
  res.status(500).json({ error: err.message }); // ✅ send real error
}
};

const joinSession = async (req, res) => {
  try {
    let session = await Session.findOne({ roomId: req.params.roomId });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is the assigned candidate
    if (req.user.email !== session.candidateEmail) {
      return res.status(403).json({ message: 'You are not authorized to join this session' });
    }

    session = await expireSessionIfNeeded(session);
    if (session.status === 'completed') {
      return res.status(400).json({ message: 'Session has already ended' });
    }

    // Check if session already has a candidate
    if (session.candidate) {
      return res.status(400).json({ message: 'Session already has a candidate' });
    }

    session.candidate = req.user.id;
    session.status = 'active';

    if (!session.timer) {
      session.timer = { duration: 60 };
    }

    const now = new Date();

    if (!session.timer.startedAt) {
      session.timer.startedAt = now;
      const duration = session.timer.duration || 60;
      session.timer.endedAt = new Date(now.getTime() + duration * 60000);
      session.endsAt = session.timer.endedAt;
    }

    await session.save();

    res.json(session);
  } catch (err) {
    console.error("FULL ERROR:", err); // ✅ shows full error
    res.status(500).json({ error: err.message });
  }
};

const updateSessionCode = async (req, res) => {
  try {
    const { code, language } = req.body;
    const session = await Session.findOne({ roomId: req.params.roomId });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.code = code ?? session.code;
    session.language = language ?? session.language;

    await session.save();

    res.json(session);
  } catch (err) {
    console.error("FULL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

const submitCode = async (req, res) => {
  try {
    const { roomId, code, language } = req.body;

    const session = await Session.findOne({ roomId });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if user is authorized (interviewer or candidate)
    if (session.interviewer.toString() !== req.user.id && 
        (!session.candidate || session.candidate.toString() !== req.user.id)) {
      return res.status(403).json({ message: "Not authorized to submit code" });
    }

    // Prevent multiple submissions
    if (session.status === 'completed') {
      return res.status(400).json({ message: "Session already completed" });
    }

    session.code = code;
    session.language = language;
    session.status = "completed";
    session.submittedAt = new Date();

    await session.save();

    res.json({ message: "Code submitted successfully", session });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionByRoomId,
  joinSession,
  updateSessionCode,
  submitCode,
};
