const asyncHandler = require('../utils/asyncHandler')
const { success } = require('../utils/apiResponse')
const dashboardService = require('../services/dashboardService')

const getDashboard = asyncHandler(async (_req, res) => {
  const data = await dashboardService.getDashboardData()
  return success(res, data)
})

module.exports = { getDashboard }
