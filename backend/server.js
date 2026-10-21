const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config()
const connectDB = require('./config/db')

const authRoutes = require('./routes/authRoutes')
const venueRoutes = require('./routes/venueRoutes')
const sessionRoutes = require('./routes/sessionRoutes')
const reportRoutes = require('./routes/reportRoutes')
const attendanceRoutes = require('./routes/attendanceRoutes')


require('./models/User')
require('./models/Venue')
require('./models/Session')
require('./models/Attendance')


const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth",authRoutes)

app.use('/api/venue', venueRoutes)
app.use('/api/session', sessionRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/attendance', attendanceRoutes)

console.log(authRoutes)

app.get("/" ,(req,res)=>{
    res.json({  message: 'Attendance System Server Running ✅'})
})

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT} ✅`)
  })
})