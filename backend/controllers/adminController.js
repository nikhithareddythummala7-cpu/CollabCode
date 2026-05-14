const User = require('../models/User');
const Session = require('../models/Session');
const Settings = require('../models/Settings');

const getAllUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error loading users' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role && !['admin', 'interviewer', 'candidate'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (status && !['active', 'blocked'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (role) {
      user.role = role;
    }

    if (status) {
      user.status = status;
    }

    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

const getAllSessions = async (req, res) => {
  try {
    const { search, status, roomId } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (roomId) {
      query.roomId = roomId;
    }

    if (search) {
      query.$or = [
        { roomId: { $regex: search, $options: 'i' } },
        { 'problem.title': { $regex: search, $options: 'i' } },
        { candidateEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const sessions = await Session.find(query)
      .populate('interviewer', 'name email role')
      .populate('candidate', 'name email role')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error loading sessions' });
  }
};

const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await Session.findByIdAndDelete(req.params.id);
    res.json({ message: 'Session deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting session' });
  }
};

const endSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.status = 'completed';
    session.timer = {
      ...session.timer,
      endedAt: new Date(),
    };
    session.endsAt = new Date();

    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error ending session' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalInterviewers, totalCandidates, totalSessions, activeSessions, completedSessions] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'interviewer' }),
      User.countDocuments({ role: 'candidate' }),
      Session.countDocuments(),
      Session.countDocuments({ status: 'active' }),
      Session.countDocuments({ status: 'completed' }),
    ]);

    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);

    const sessionsPerDay = await Session.aggregate([
      {
        $match: {
          createdAt: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      totalUsers,
      totalInterviewers,
      totalCandidates,
      totalSessions,
      activeSessions,
      completedSessions,
      sessionsPerDay,
      userGrowth,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error loading analytics' });
  }
};

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error loading settings' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const updates = {
      defaultTimerDuration: req.body.defaultTimerDuration,
      registrationEnabled: req.body.registrationEnabled,
      supportedLanguages: req.body.supportedLanguages,
      updatedAt: new Date(),
    };

    const settings = await Settings.findOneAndUpdate({}, updates, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating settings' });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllSessions,
  deleteSession,
  endSession,
  getAnalytics,
  getSettings,
  updateSettings,
};
