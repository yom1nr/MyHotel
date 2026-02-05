const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const db = require('../config/db')

async function login(req, res) {
  try {
    const { email, password } = req.body || {}

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const plainPassword = typeof password === 'string' ? password : ''

    if (!normalizedEmail || !plainPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
    }

    const [rows] = await db.query(
      'SELECT id, full_name, email, password_hash, role, is_active FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1',
      [normalizedEmail]
    )

    const user = rows?.[0]

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    if (Number(user.is_active) === 0) {
      return res.status(403).json({
        success: false,
        message: 'User is inactive',
      })
    }

    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    const ok = await bcrypt.compare(plainPassword, String(user.password_hash))
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'JWT secret is not configured',
      })
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.full_name,
      },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    )

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
        },
      },
    })
  } catch (_error) {
    return res.status(500).json({
      success: false,
      message: 'Login failed',
    })
  }
}

module.exports = { login }
