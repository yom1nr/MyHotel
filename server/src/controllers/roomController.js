const asyncHandler = require('../utils/asyncHandler')
const { success, created } = require('../utils/apiResponse')
const roomService = require('../services/room.service')

const getAllRooms = asyncHandler(async (_req, res) => {
  const rooms = await roomService.getAllRooms()
  return success(res, rooms)
})

const getPublicRooms = asyncHandler(async (_req, res) => {
  const rooms = await roomService.getPublicRooms()
  return success(res, rooms)
})

const getRoomById = asyncHandler(async (req, res) => {
  const room = await roomService.getRoomById(req.params.id)
  return success(res, room)
})

const createRoom = asyncHandler(async (req, res) => {
  const room = await roomService.createRoom(req.body)
  return created(res, room)
})

const updateRoom = asyncHandler(async (req, res) => {
  const room = await roomService.updateRoom(req.params.id, req.body)
  return success(res, room)
})

const deleteRoom = asyncHandler(async (req, res) => {
  const data = await roomService.deleteRoom(req.params.id)
  return success(res, data)
})

module.exports = { getAllRooms, getPublicRooms, getRoomById, createRoom, updateRoom, deleteRoom }
