const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  defaultTimerDuration: {
    type: Number,
    default: 60,
  },
  registrationEnabled: {
    type: Boolean,
    default: true,
  },
  supportedLanguages: {
    type: [String],
    default: ['javascript', 'python', 'java'],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Settings', settingsSchema);
