const express = require('express')
const router = express.Router()
const { 
  markAttendance, 
  getMyAttendance 
} = require('../controllers/attendanceController')
const { 
  protect, 
  studentOnly 
} = require('../middleware/authMiddleware')

// Student only - mark attendance
router.post('/mark', protect, studentOnly, markAttendance)

router.get('/my', protect, studentOnly, getMyAttendance)

module.exports = router
