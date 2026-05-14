const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllSessions,
  deleteSession,
  endSession,
  getAnalytics,
  getSettings,
  updateSettings,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/sessions', getAllSessions);
router.put('/sessions/:id/end', endSession);
router.delete('/sessions/:id', deleteSession);

router.get('/analytics', getAnalytics);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
