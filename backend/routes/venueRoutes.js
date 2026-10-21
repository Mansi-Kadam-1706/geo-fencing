const express = require('express')
const router = express.Router()
const { addVenue, getVenues } = require('../controllers/venueController')
const { protect, professorOnly } = require('../middleware/authMiddleware')

router.post("/add" , protect,professorOnly,addVenue)

router.get("/all",protect,getVenues)

module.exports = router