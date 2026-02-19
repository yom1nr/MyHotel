const { createLogger, format, transports } = require('winston')

const isProd = process.env.NODE_ENV === 'production'

const logger = createLogger({
    level: isProd ? 'info' : 'debug',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        isProd
            ? format.json()
            : format.combine(format.colorize(), format.printf(({ timestamp, level, message, requestId, ...rest }) => {
                const rid = requestId ? ` [${requestId}]` : ''
                const extra = Object.keys(rest).length ? ' ' + JSON.stringify(rest) : ''
                return `${timestamp} ${level}${rid}: ${message}${extra}`
            }))
    ),
    defaultMeta: { service: 'hotel-api' },
    transports: [new transports.Console()],
})

module.exports = logger
