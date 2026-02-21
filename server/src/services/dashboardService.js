const db = require('../config/db')

async function getTotalRooms() {
  const [[row]] = await db.query('SELECT COUNT(*) AS totalRooms FROM rooms')
  return Number(row?.totalRooms || 0)
}

async function getOccupiedRooms() {
  const [[row]] = await db.query(
    "SELECT COUNT(*) AS occupiedRooms FROM rooms WHERE status IN ('occupied','reserved')"
  )
  return Number(row?.occupiedRooms || 0)
}

async function getTotalRevenue() {
  const [[row]] = await db.query(
    'SELECT COALESCE(SUM(amount), 0) AS totalRevenue FROM transactions'
  )
  return Number(row?.totalRevenue || 0)
}

async function getRecentBookings(limit = 5) {
  const [rows] = await db.query(
    `SELECT
      b.id,
      b.booking_code,
      b.guest_full_name,
      b.check_in_date,
      b.check_out_date,
      b.total_amount,
      b.status,
      r.room_number
    FROM bookings b
    JOIN rooms r ON r.id = b.room_id
    ORDER BY b.created_at DESC
    LIMIT ?`,
    [limit]
  )

  return rows
}

async function getTotalBookings() {
  const [[row]] = await db.query('SELECT COUNT(*) AS totalBookings FROM bookings')
  return Number(row?.totalBookings || 0)
}

async function getNetProfit() {
  const [[row]] = await db.query(
    `SELECT
      COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN type = 'refund' THEN amount ELSE 0 END), 0) AS refunds,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
    FROM transactions
    WHERE status = 'paid'`
  )

  const income = Number(row?.income || 0)
  const refunds = Number(row?.refunds || 0)
  const expenses = Number(row?.expenses || 0)
  return income - refunds - expenses
}

async function getRevenueByMonth(months = 6) {
  const [rows] = await db.query(
    `SELECT
      DATE_FORMAT(t.transaction_date, '%Y-%m-01') AS month,
      COALESCE(SUM(t.amount), 0) AS revenue
    FROM transactions t
    WHERE t.type = 'payment' AND t.status = 'paid'
      AND t.transaction_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
    GROUP BY DATE_FORMAT(t.transaction_date, '%Y-%m-01')
    ORDER BY month ASC`,
    [months - 1]
  )

  return rows.map((r) => ({
    month: r.month,
    revenue: Number(r.revenue || 0),
  }))
}

async function getDashboardData() {
  const [
    totalRooms,
    occupiedRooms,
    totalRevenue,
    recentBookings,
    totalBookings,
    netProfit,
    revenueByMonth,
  ] = await Promise.all([
    getTotalRooms(),
    getOccupiedRooms(),
    getTotalRevenue(),
    getRecentBookings(5),
    getTotalBookings(),
    getNetProfit(),
    getRevenueByMonth(6),
  ])

  return {
    totalRooms,
    occupiedRooms,
    totalRevenue,
    recentBookings,
    totalBookings,
    netProfit,
    revenueByMonth,
  }
}

module.exports = {
  getDashboardData,
}
