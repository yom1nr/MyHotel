const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
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
router.post('/', createRoom)
router.put('/:id', updateRoom)
router.delete('/:id', deleteRoom)

module.exports = router
