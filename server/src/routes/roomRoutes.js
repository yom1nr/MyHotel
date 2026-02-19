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

router.get('/', getAllRooms)
router.get('/:id', getRoomById)
router.post('/', validate(createRoomSchema), createRoom)
router.put('/:id', validate(updateRoomSchema), updateRoom)
router.delete('/:id', deleteRoom)

module.exports = router
