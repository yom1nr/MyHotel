require('dotenv').config()

const app = require('./app')
const logger = require('./config/logger')
const db = require('./config/db')

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
})

function gracefulShutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully`)
  server.close(async () => {
    try {
      await db.end()
      logger.info('Database pool closed')
    } catch (_err) {
      // ignore
    }
    process.exit(0)
  })

  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10_000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
