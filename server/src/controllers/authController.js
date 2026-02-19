const asyncHandler = require('../utils/asyncHandler')
const { success } = require('../utils/apiResponse')
const authService = require('../services/auth.service')

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body)
  return success(res, data, 'Login successful')
})

module.exports = { login }
