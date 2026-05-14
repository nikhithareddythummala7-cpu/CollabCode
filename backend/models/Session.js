const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  interviewer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  candidate: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  candidateEmail: {
    type: String,
    required: true,
  },
  problem: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
  },
  code: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: 'javascript',
  },
  messages: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Message',
  }],
  timer: {
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    expiresAt: Date, // When waiting session expires if no candidate joins
    startedAt: Date, // When candidate joined (interview started)
    endedAt: Date, // When interview should end (startedAt + duration)
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed'],
    default: 'waiting',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  startedAt: {
  type: Date,
},

endsAt: {
  type: Date,
},

submittedAt: {
  type: Date,
},
});

module.exports = mongoose.model('Session', sessionSchema);