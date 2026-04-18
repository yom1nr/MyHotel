const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const validate = require('../middleware/validate')
const { createRoomSchema, updateRoomSchema } = require('../validators/room.schema')
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController')

const router = express.Router()

router.use(authMiddleware)

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     tags: [Rooms]
 *     summary: Get all rooms
 *     description: Retrieve a list of all rooms with their current status.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rooms
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
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getAllRooms)

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     tags: [Rooms]
 *     summary: Get room by ID
 *     description: Retrieve a single room by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Room'
 *       404:
 *         description: Room not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getRoomById)

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     tags: [Rooms]
 *     summary: Create a new room
 *     description: Add a new room to the hotel.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoomRequest'
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Room'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', validate(createRoomSchema), createRoom)

/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     tags: [Rooms]
 *     summary: Update a room
 *     description: Update room details by ID. All fields are optional.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoomRequest'
 *     responses:
 *       200:
 *         description: Room updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Room'
 *       404:
 *         description: Room not found
 */
router.put('/:id', validate(updateRoomSchema), updateRoom)

/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     tags: [Rooms]
 *     summary: Delete a room
 *     description: Permanently remove a room from the system.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Room not found
 */
router.delete('/:id', deleteRoom)

module.exports = router
