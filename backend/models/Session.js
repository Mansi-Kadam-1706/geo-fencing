const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
  venue_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  },
  professor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true    // "DBMS", "OS", etc
  },
  qr_token: {
    type: String,
    required: true,
    unique: true      // unique token per session
  },
  expires_at: {
    type: Date,
    required: true    // createdAt + 2 minutes
  },
  is_active: {
    type: Boolean,
    default: true     // false after QR expires
  }
}, { timestamps: true })

module.exports = mongoose.model('Session', sessionSchema)