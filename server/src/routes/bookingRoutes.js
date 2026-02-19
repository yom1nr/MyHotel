const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const validate = require('../middleware/validate')
const { createBookingSchema, updateBookingStatusSchema } = require('../validators/booking.schema')
const {
  createBooking,
  getBookings,
  getBookingByCode,
  updateBookingStatus,
} = require('../controllers/bookingController')

const router = express.Router()

router.get('/status', getBookingByCode)

router.use(authMiddleware)

router.get('/', getBookings)
router.post('/', validate(createBookingSchema), createBooking)
router.put('/:id/status', validate(updateBookingStatusSchema), updateBookingStatus)

module.exports = router
