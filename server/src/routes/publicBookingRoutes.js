const express = require('express')

const { createPublicBooking } = require('../controllers/bookingController')

const router = express.Router()

router.post('/bookings', createPublicBooking)

module.exports = router
