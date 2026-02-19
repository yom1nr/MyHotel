const asyncHandler = require('../utils/asyncHandler')
const { success, created } = require('../utils/apiResponse')
const userService = require('../services/user.service')

const getStaff = asyncHandler(async (_req, res) => {
  const rows = await userService.getStaff()
  return success(res, rows)
})

const createStaff = asyncHandler(async (req, res) => {
  const staff = await userService.createStaff(req.body)
  return created(res, staff)
})

const deleteStaff = asyncHandler(async (req, res) => {
  const data = await userService.deleteStaff(req.params.id)
  return success(res, data)
})

const setStaffActive = asyncHandler(async (req, res) => {
  const staff = await userService.setStaffActive(req.params.id, req.body.is_active)
  return success(res, staff)
})

module.exports = { getStaff, createStaff, deleteStaff, setStaffActive }
