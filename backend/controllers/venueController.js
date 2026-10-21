const Venue = require("../models/Venue")

const addVenue = async(req,res)=>{

    try{
        const {name,latitude,longitude,radius} = req.body

        const existing = await Venue.findOne({name})
        if(existing){
            return res.status(400).json({
                message:"venue already exits"
            })
        }
        const venue = await Venue.create({
            name,
            latitude,
            longitude,
            radius,
            created_by:req.user._id
        })
        res.status(201).json({
            message: 'Venue added successfully ✅',
            venue
        })

    }catch(err){
        res.status(500).json({ message: 'Server error', error: err.message })

    }
}

const getVenues = async(req,res)=>{
    try{
        const venues = await Venue.find()
        res.json(venues)
    }catch(err){
         res.status(500).json({ message: 'Server error', error: err.message })
    }
}
module.exports = { addVenue, getVenues }
