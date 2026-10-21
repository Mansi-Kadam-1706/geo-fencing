const mongoose = require('mongoose')

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,   // "Seminar Hall A"
    trim: true
  },
  latitude: {
    type: Number,
    required: true    // fixed hall GPS coordinate
  },
  longitude: {
    type: Number,
    required: true    // fixed hall GPS coordinate
  },
  radius: {
    type: Number,
    default: 100      // geofence 100 meters
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'       // professor who added venue
  }
}, { timestamps: true })

module.exports = mongoose.model('Venue', venueSchema)