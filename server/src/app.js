const express = require('express')
const cors = require('cors')

const indexRoutes = require('./routes')
const authRoutes = require('./routes/authRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const roomRoutes = require('./routes/roomRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const publicBookingRoutes = require('./routes/publicBookingRoutes')
const publicRoomRoutes = require('./routes/publicRoomRoutes')
const transactionRoutes = require('./routes/transactionRoutes')
const reportRoutes = require('./routes/reportRoutes')
const userRoutes = require('./routes/userRoutes')
const attendanceRoutes = require('./routes/attendanceRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/public', publicBookingRoutes)
app.use('/api/public', publicRoomRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/users', userRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api', indexRoutes)

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

module.exports = app
