const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const db = require('../config/db')
const { UnauthorizedError, ForbiddenError, AppError } = require('../utils/AppError')

async function login({ email, password }) {
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const plainPassword = typeof password === 'string' ? password : ''

    if (!normalizedEmail || !plainPassword) {
        throw new UnauthorizedError('Email and password are required')
    }

    const [rows] = await db.query(
        'SELECT id, full_name, email, password_hash, role, is_active FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1',
        [normalizedEmail]
    )

    const user = rows?.[0]
    if (!user) throw new UnauthorizedError('Invalid credentials')
    if (Number(user.is_active) === 0) throw new ForbiddenError('User is inactive')
    if (!user.password_hash) throw new UnauthorizedError('Invalid credentials')

    const ok = await bcrypt.compare(plainPassword, String(user.password_hash))
    if (!ok) throw new UnauthorizedError('Invalid credentials')

    const secret = process.env.JWT_SECRET
    if (!secret) throw new AppError('JWT secret is not configured', 500, 'CONFIG_ERROR')

    const token = jwt.sign(
        { sub: user.id, email: user.email, role: user.role, name: user.full_name },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    )

    return {
        token,
        user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role },
    }
}

module.exports = { login }
