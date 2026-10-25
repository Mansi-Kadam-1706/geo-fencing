const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema({
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  marked_at: {
    type: Date,
    default: Date.now
  },
  student_lat: {
    type: Number,
    required: true    // where student marked from
  },
  student_lng: {
    type: Number,
    required: true    // where student marked from
  },
  zone: {
    type: String,
    enum: ['INSIDE', 'BORDER', 'EDGE', 'MANUAL'],
    default: 'INSIDE' // geofence zone detection
  },
  distance:{
    type:Number,
    default:0
  },
  is_present: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

// Prevent duplicate attendance
// Same student cannot mark twice in same session
attendanceSchema.index(
    { session_id:1,student_id:1},
    {unique:true}
)

module.exports = mongoose.model('Attendance', attendanceSchema)