const express = require('express')
const router = express.Router()
const { getSessionReport } = require('../controllers/reportController')
const { protect, professorOnly } = require('../middleware/authMiddleware')

// Professor only
router.get('/:session_id', protect, professorOnly, getSessionReport)

module.exports = router