const asyncHandler = require('../utils/asyncHandler')
const { success, created } = require('../utils/apiResponse')
const bookingService = require('../services/booking.service')

const createBooking = asyncHandler(async (req, res) => {
  const userId = req.user?.sub ? Number(req.user.sub) : null
  const booking = await bookingService.createBooking(req.body, userId)
  return created(res, booking)
})

const createPublicBooking = asyncHandler(async (req, res) => {
  const data = await bookingService.createPublicBooking(req.body)
  return created(res, data)
})

const getBookings = asyncHandler(async (_req, res) => {
  const bookings = await bookingService.getBookings()
  return success(res, bookings)
})

const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateBookingStatus(req.params.id, req.body.status, req.body.paymentMethod)
  return success(res, booking)
})

const getBookingByCode = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingByCode(req.query.code, req.query.phone)
  return success(res, booking)
})

module.exports = { createBooking, createPublicBooking, getBookings, updateBookingStatus, getBookingByCode }
