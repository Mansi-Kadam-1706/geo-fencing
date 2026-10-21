const Attendance = require('../models/Attendance')
const Session = require('../models/Session')
const Venue = require('../models/Venue')
const User = require('../models/User')
const { checkGeofenceStatus } = require('../utils/geofence')

const markAttendance = async(req,res)=>{
    try{
        const {qr_token, latitude, longitude , device_id} = req.body
        const student_id = req.user._id

        // ─────────────────────────────
       // CHECK 1 — Device ID
      // ─────────────────────────────
      const student = await User.findById(student_id)

     if (!student.device_id) {
      // First time marking — save device
      await User.findByIdAndUpdate(student_id, { device_id })

    } else if (student.device_id !== device_id) {
      // Different device — REJECT
      return res.status(403).json({
        message: '❌ Wrong device. Attendance can only be marked from your registered phone.'
      })
    }
      // ─────────────────────────────
    // CHECK 2 — Find Session
    // ─────────────────────────────
    const session = await Session.findOne({qr_token})
        .populate("venue_id")

        if (!session) {
      return res.status(404).json({
        message: ' Invalid QR or Session ID'
      })
    } 

     // ─────────────────────────────
    // CHECK 3 — QR Expiry (2 mins)
    // ─────────────────────────────

    const now = new Date()
    if(now>new Date(session.expires_at)){
          return res.status(400).json({
        message: ' QR code has expired. Ask professor to regenerate.'
      })
    }

     // ─────────────────────────────
    // CHECK 4 — Geofence Check
    // ─────────────────────────────
    const venue = session.venue_id

    const geofenceResult = checkGeofenceStatus(
        latitude, longitude,       // student GPS
      venue.latitude, venue.longitude, // hall center
      venue.radius               // 100m
    )

    // Student is outside hall
    if(!geofenceResult.allowed){
      return res.status(400).json({
        message: geofenceResult.message,
        distance: geofenceResult.distance,
        zone: geofenceResult.zone
      })
    }
    // ─────────────────────────────
    // CHECK 5 — Duplicate Check
    // ─────────────────────────────
    const existing = await Attendance.findOne({
      session_id:session._id,
      student_id
    })

     if (existing) {
      return res.status(400).json({
        message: '⚠️ Attendance already marked for this session',
        zone: existing.zone,
        marked_at: existing.marked_at
      })
    }

    const attendance = await Attendance.create({
      session_id:session._id,
      student_id,
      student_lat: latitude,
      student_lng: longitude,
      zone: geofenceResult.zone,
      distance: geofenceResult.distance,
      is_present: true
    })
    res.status(201).json({
      message: geofenceResult.message,
      zone: geofenceResult.zone,
      distance: geofenceResult.distance,
      marked_at: attendance.marked_at
    })


    }catch(err){
      res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    })
    }
}

// ─────────────────────────────
// GET MY ATTENDANCE (Student)
// ─────────────────────────────
const getMyAttendance = async(req,res)=>{
  try{
    const student_id = req.user._id

    const records = await Attendance.find({student_id})
    .populate({
      path:"session_id",
      populate:{
        path:"venue_id",
        select:"name"
      },
      select:"subject createdAt venue_id"
    })
    .sort({marked_at:-1})

    const total = records.length
    const present = records.filter(r => r.is_present).length
    const percentage = total > 0 
      ? ((present / total) * 100).toFixed(1) 
      : 0

      res.json({
        total_sessions:total,
        present,
        percentage: `${percentage}%`,
        records: records.map(r=>({
          subject:r.session_id?.subject,
          venue:r.session_id?.venue_id?.name,
          date:r.session_id?.createdAt,
          zone: r.zone,
        distance: r.distance,
        marked_at: r.marked_at,
         zone_display:
          r.zone === 'INSIDE' ? '✅ Inside' :
          r.zone === 'BORDER' ? ' Border' :
          r.zone === 'EDGE'   ? ' Edge'   :
          r.zone === 'MANUAL' ? ' Manual' : ''
        }))
      })

  }catch(err){
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    })

  }
}
module.exports = { markAttendance, getMyAttendance }