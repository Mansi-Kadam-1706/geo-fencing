const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  roll_no: {
    type: String,
    unique: true,
    sparse: true    // only for students
  },
  role: {
    type: String,
    enum: ['student', 'professor'],
    required: true
  },
  device_id: {
    type: String,
    default: null   // set on first login
  }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)