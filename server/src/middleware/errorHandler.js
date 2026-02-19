const logger = require('../config/logger')
const { AppError } = require('../utils/AppError')

function errorHandler(err, req, res, _next) {
    const requestId = req.requestId || '-'

    if (err instanceof AppError) {
        logger.warn(err.message, {
            requestId,
            statusCode: err.statusCode,
            code: err.code,
            path: req.originalUrl,
        })

        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code,
            ...(err.details ? { details: err.details } : {}),
        })
    }

    logger.error(err.message || 'Internal Server Error', {
        requestId,
        stack: err.stack,
        path: req.originalUrl,
    })

    return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : err.message || 'Internal Server Error',
        code: 'INTERNAL_ERROR',
    })
}

module.exports = errorHandler
