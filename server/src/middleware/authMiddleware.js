const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      })
    }

    const token = header.substring('Bearer '.length)
    const secret = process.env.JWT_SECRET

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'JWT secret is not configured',
      })
    }

    const payload = jwt.verify(token, secret)
    req.user = payload
    return next()
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    })
  }
}

module.exports = authMiddleware
