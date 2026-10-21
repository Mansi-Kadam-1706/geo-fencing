const express = require('express')
const router = express.Router()
const { createSession, regenerateQR, getSession } = require('../controllers/sessionController')
const { protect, professorOnly } = require('../middleware/authMiddleware')

router.post('/create', protect, professorOnly, createSession)
router.put("/regenerate/:session_id",protect,professorOnly,regenerateQR)

router.get("/:session_id" , protect,getSession)

module.exports = router