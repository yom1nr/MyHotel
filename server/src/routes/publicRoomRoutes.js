const express = require('express')

const { getPublicRooms } = require('../controllers/roomController')

const router = express.Router()

router.get('/rooms', getPublicRooms)

module.exports = router
