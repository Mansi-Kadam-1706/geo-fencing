const express = require('express')
const router = express.Router()
const { getSessionReport, manualMark } = require('../controllers/reportController')
const { protect, professorOnly } = require('../middleware/authMiddleware')

// Professor only
router.post('/manual-mark', protect, professorOnly, manualMark)
router.get('/:session_id', protect, professorOnly, getSessionReport)

module.exports = router