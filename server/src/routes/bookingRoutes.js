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

/**
 * @swagger
 * /api/bookings/status:
 *   get:
 *     tags: [Bookings]
 *     summary: Check booking status
 *     description: Look up a booking by its code and guest phone number. No authentication required.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking code (e.g. BK-ABC123-XY12)
 *       - in: query
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: Guest phone number
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Missing code or phone
 *       404:
 *         description: Booking not found
 */
router.get('/status', getBookingByCode)

router.use(authMiddleware)

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: Get all bookings
 *     description: Retrieve all bookings with room info and paid amounts. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 */
router.get('/', getBookings)

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a booking (staff)
 *     description: Create a new booking as a staff member. Automatically generates a payment transaction.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingRequest'
 *     responses:
 *       201:
 *         description: Booking created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Room is not available
 */
router.post('/', validate(createBookingSchema), createBooking)

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   put:
 *     tags: [Bookings]
 *     summary: Update booking status
 *     description: |
 *       Change the status of a booking. Side effects:
 *       - `checked_in` → room becomes "occupied"
 *       - `checked_out` → room becomes "available", remaining balance auto-charged
 *       - `cancelled` → room becomes "available", auto-refund created
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBookingStatusRequest'
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid booking id
 *       404:
 *         description: Booking not found
 */
router.put('/:id/status', validate(updateBookingStatusSchema), updateBookingStatus)

module.exports = router
