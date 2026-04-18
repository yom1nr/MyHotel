const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')

const requestId = require('./middleware/requestId')
const errorHandler = require('./middleware/errorHandler')
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter')
const logger = require('./config/logger')

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

const isProd = process.env.NODE_ENV === 'production'

if (isProd) app.set('trust proxy', 1)

app.use(helmet({ contentSecurityPolicy: false }))
app.use(compression())
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))
app.use(requestId)
app.use(generalLimiter)

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, { requestId: req.requestId })
  next()
})

app.use('/api/auth', authLimiter, authRoutes)
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
app.use('/api/payment', require('./routes/paymentRoutes'));

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  })
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MyHotel API Documentation',
}))
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec))

app.use(errorHandler)

module.exports = app
