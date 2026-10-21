const Attendance = require('../models/Attendance')
const Session = require('../models/Session')
const User = require('../models/User')

// ─────────────────────────────
// GET SESSION REPORT
// ─────────────────────────────
const getSessionReport = async (req, res) => {
  try {
    const { session_id } = req.params

    const session = await Session.findById(session_id)
      .populate('venue_id')

    if (!session) {
      return res.status(404).json({
        message: 'Session not found'
      })
    }

    const allStudents = await User.find({ role: 'student' })
      .select('name roll_no email')

    const attendanceRecords = await Attendance.find({ session_id })
      .populate('student_id', 'name roll_no email')

    // ✅ Fix Bug 1 — record not records
    const attendanceMap = {}
    attendanceRecords.forEach(record => {
      attendanceMap[record.student_id._id.toString()] = record
    })

    // ✅ Fix Bug 2 — student not students
    const report = allStudents.map(student => {
      const record = attendanceMap[student._id.toString()]

      if (record) {
        return {
          student_id: student._id,
          roll_no: student.roll_no,
          name: student.name,
          email: student.email,
          status: 'PRESENT',
          zone: record.zone,
          distance: record.distance,
          marked_at: record.marked_at,
          zone_display:
            record.zone === 'INSIDE' ? '✅ Inside' :
            record.zone === 'BORDER' ? '⚠️ Border' :
            record.zone === 'EDGE'   ? '🔶 Edge'   :
            record.zone === 'MANUAL' ? '📝 Manual' : ''
        }
      } else {
        return {
          student_id: student._id,
          roll_no: student.roll_no,
          name: student.name,
          email: student.email,
          status: 'ABSENT',
          zone: null,
          distance: null,
          marked_at: null,
          zone_display: '❌ Absent'
        }
      }
    })

    const present  = report.filter(s => s.status === 'PRESENT').length
    const absent   = report.filter(s => s.status === 'ABSENT').length
    const onBorder = report.filter(s => s.zone === 'BORDER').length
    const onEdge   = report.filter(s => s.zone === 'EDGE').length

    res.json({
      session: {
        subject: session.subject,
        venue: session.venue_id.name,
        date: session.createdAt
      },
      summary: {
        total: allStudents.length,
        present,
        absent,
        on_border: onBorder,
        on_edge: onEdge
      },
      students: report
    })

  } catch (err) {
    console.log('REPORT ERROR:', err.message)
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    })
  }
}

// ─────────────────────────────
// MANUAL MARK
// ─────────────────────────────
const manualMark = async (req, res) => {
  try {
    const { session_id, student_id } = req.body

    const session = await Session.findById(session_id)
    if (!session) {
      return res.status(404).json({
        message: 'Session not found'
      })
    }

    if (session.professor_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized'
      })
    }

    const existing = await Attendance.findOne({
      session_id,
      student_id
    })
    if (existing) {
      return res.status(400).json({
        message: 'Attendance already marked'
      })
    }

    await Attendance.create({
      session_id,
      student_id,
      student_lat: 0,
      student_lng: 0,
      zone: 'MANUAL',
      distance: 0,
      is_present: true
    })

    res.json({ message: 'Marked manually ✅' })

  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    })
  }
}

module.exports = { getSessionReport, manualMark }