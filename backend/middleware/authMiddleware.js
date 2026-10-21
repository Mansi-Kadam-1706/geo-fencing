const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async(req,res,next) =>{
    try{
        const token = req.headers.authorization?.split(" ")[1]

        if(!token){
            return res.status(401).json({
                message:'No token - access denied'
            })
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        // Attach user to request
        req.user = await User.findById(decoded.id).select('-password')

        next()

    }catch{
        res.status(401).json({ message: 'Invalid token' })
    }
}

const professorOnly = (req, res, next) => {
  if (req.user.role !== 'professor') {
    return res.status(403).json({ 
      message: 'Access denied - professors only' 
    })
  }
  next()
}

const studentOnly = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      message: 'Access denied - students only' 
    })
  }
  next()
}

module.exports = { protect, professorOnly, studentOnly }