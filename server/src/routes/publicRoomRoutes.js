const express = require('express')

const { getPublicRooms } = require('../controllers/roomController')

const router = express.Router()

/**
 * @swagger
 * /api/public/rooms:
 *   get:
 *     tags: [Public Rooms]
 *     summary: Get available rooms (public)
 *     description: Retrieve all available rooms for the public booking page. No authentication required.
 *     responses:
 *       200:
 *         description: List of available rooms
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Room'
 */
router.get('/rooms', getPublicRooms)

module.exports = router
