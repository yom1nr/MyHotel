const express = require('express')

const { createPublicBooking, payDeposit } = require('../controllers/bookingController')

const router = express.Router()

/**
 * @swagger
 * /api/public/bookings:
 *   post:
 *     tags: [Public Booking]
 *     summary: Create a booking (guest)
 *     description: |
 *       Allow guests to create a booking from the public website.
 *       The booking is created with status "pending" and requires deposit payment to confirm.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PublicBookingRequest'
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
 *                       type: object
 *                       properties:
 *                         booking_code:
 *                           type: string
 *                           example: BK-ABC123-XY12
 *       400:
 *         description: Validation error
 *       409:
 *         description: Room is not available
 */
router.post('/bookings', createPublicBooking)

/**
 * @swagger
 * /api/public/bookings/{code}/deposit:
 *   post:
 *     tags: [Public Booking]
 *     summary: Pay deposit for a booking
 *     description: |
 *       Pay a 50% deposit to confirm a pending booking.
 *       Requires the booking code (from URL) and guest phone number (in body).
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: '0812345678'
 *     responses:
 *       200:
 *         description: Deposit paid, booking confirmed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         success:
 *                           type: boolean
 *                         booking_id:
 *                           type: integer
 *       400:
 *         description: Booking is not in pending state
 *       404:
 *         description: Booking not found
 */
router.post('/bookings/:code/deposit', payDeposit)

module.exports = router
