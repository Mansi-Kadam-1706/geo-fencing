const Session = require('../models/Session')
const Venue = require('../models/Venue')
const QRCode = require('qrcode')
const { v4: uuidv4 } = require('uuid')

const createSession = async (req, res) => {
  try {
    const { venue_id, subject } = req.body
    const professor_id = req.user._id

    const venue = await Venue.findById(venue_id)
    if (!venue) {
      return res.status(404).json({
        message: 'Venue not found'
      })
    }

    // ✅ Fix 1 — uuidv4 correct name
    const qr_token = uuidv4()
    const expires_at = new Date(Date.now() + 2 * 60 * 1000)

    // ✅ Fix 2 — create correct spelling
    const session = await Session.create({
      venue_id,
      professor_id,
      subject,
      qr_token,
      expires_at,
      is_active: true
    })

    const qrData = JSON.stringify({
      token: qr_token,
      session_id: session._id
    })

    const qrImage = await QRCode.toDataURL(qrData)

    res.status(201).json({
      message: 'Session created successfully ✅',
      session_id: session._id,
      qr_token,
      qrImage,
      expires_at,
      subject,
      venue: venue.name
    })

  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    })
  }
}

const regenerateQR = async (req, res) => {
  try {
    const { session_id } = req.params

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

    // ✅ Fix 1 — uuidv4 correct name
    const qr_token = uuidv4()
    const expires_at = new Date(Date.now() + 2 * 60 * 1000)

    await Session.findByIdAndUpdate(session_id, {
      qr_token,
      expires_at,
      is_active: true
    })

    const qrData = JSON.stringify({
      token: qr_token,
      session_id: session._id
    })

    const qrImage = await QRCode.toDataURL(qrData)

    res.json({
      message: 'QR regenerated successfully ✅',
      session_id,
      qr_token,
      qrImage,
      expires_at
    })

  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    })
  }
}

const getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.session_id)
      .populate('venue_id')
      .populate('professor_id', 'name')

    if (!session) {
      return res.status(404).json({
        message: 'Session not found'
      })
    }

    res.json(session)

  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    })
  }
}

module.exports = { createSession, regenerateQR, getSession }