const express = require('express')

const { createPublicBooking, payDeposit } = require('../controllers/bookingController')

const router = express.Router()

router.post('/bookings', createPublicBooking)
router.post('/bookings/:code/deposit', payDeposit)

module.exports = router
