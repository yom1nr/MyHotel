const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
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
router.post('/', createBooking)
router.put('/:id/status', updateBookingStatus)

module.exports = router
