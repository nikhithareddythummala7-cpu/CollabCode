const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  createSession,
  getSessions,
  getSessionByRoomId,
  joinSession,
  updateSessionCode,
  submitCode,
} = require('../controllers/sessionController');

const router = express.Router();

// @desc    Create a new session
// @route   POST /api/sessions
// @access  Private (Interviewer only)
router.post(
  '/',
  protect,
  authorize('interviewer'),
  [
    body('problem.title', 'Problem title is required').not().isEmpty(),
    body('problem.description', 'Problem description is required').not().isEmpty(),
    body('timer.duration', 'Timer duration is required').isNumeric(),
    body('candidateEmail', 'Candidate email is required').isEmail(),
  ],
  createSession
);

// @desc    Get all sessions for user
// @route   GET /api/sessions
// @access  Private
router.get('/', protect, getSessions);

// @desc    Get session by room ID
// @route   GET /api/sessions/:roomId
// @access  Private
router.get('/:roomId', protect, getSessionByRoomId);

// @desc    Join session
// @route   PUT /api/sessions/:roomId/join
// @access  Private
router.put('/:roomId/join', protect, joinSession);

// @desc    Update session code
// @route   PUT /api/sessions/:roomId/code
// @access  Private
router.put('/:roomId/code', protect, updateSessionCode);

// @desc    Submit code and complete session
// @route   POST /api/sessions/submit
// @access  Private
router.post('/submit', protect, submitCode);

module.exports = router;