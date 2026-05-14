const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.ObjectId,
    ref: 'Session',
    required: true,
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', messageSchema);