const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// ─────────────────────────────
// REGISTER
// ─────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, roll_no, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email already registered' 
      })
    }

    // Check duplicate roll_no for students
    if (role === 'student') {
      const existingRoll = await User.findOne({ roll_no })
      if (existingRoll) {
        return res.status(400).json({ 
          message: 'Roll number already registered' 
        })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roll_no: role === 'student' ? roll_no : undefined,
      role,
      device_id: null   // set on first login
    })

    res.status(201).json({ 
      message: 'Registered successfully ✅',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─────────────────────────────
// LOGIN
// ─────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password, device_id } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Invalid password' 
      })
    }
     // ✅ Always update device_id — no checking
    if (!user.device_id) {
      await User.findByIdAndUpdate(user._id, { device_id })
    }


    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ 
      message: 'Login successful ✅',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roll_no: user.roll_no
      }
    })

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─────────────────────────────
// GET PROFILE
// ─────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { register, login, getProfile }