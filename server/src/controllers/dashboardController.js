const { getDashboardData } = require('../services/dashboardService')

async function getDashboard(req, res) {
  try {
    const data = await getDashboardData()
    res.json({ success: true, data })
  } catch (_error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
    })
  }
}

module.exports = { getDashboard }
