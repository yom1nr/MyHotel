const bcrypt = require('bcrypt')

const db = require('../config/db')
const { NotFoundError, ValidationError, AppError } = require('../utils/AppError')

const ALLOWED_STAFF_ROLES = new Set([
    'admin', 'manager', 'receptionist', 'housekeeper', 'maintenance', 'accountant',
])

async function getStaff() {
    const [rows] = await db.query(
        `SELECT id, full_name, email, role, NULL AS staff_position, phone, is_active, created_at, updated_at
     FROM users
     WHERE role IN ('admin','manager','receptionist','housekeeper','maintenance','accountant')
     ORDER BY created_at DESC LIMIT 500`
    )
    return rows
}

async function createStaff(data) {
    if (!data.full_name) throw new ValidationError('full_name is required')
    if (!data.email) throw new ValidationError('email is required')
    if (!data.password || data.password.length < 6) throw new ValidationError('password is required (min 6 chars)')

    const normalizedEmail = data.email.trim().toLowerCase()
    const normalizedRole = data.role ? String(data.role).toLowerCase().trim() : ''
    if (!normalizedRole || !ALLOWED_STAFF_ROLES.has(normalizedRole)) throw new ValidationError('Invalid role')

    const [[existing]] = await db.query(
        'SELECT id FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1',
        [normalizedEmail]
    )
    if (existing?.id) throw new AppError('Email already exists', 409, 'DUPLICATE')

    const passwordHash = await bcrypt.hash(data.password, 10)

    const insert = {
        full_name: data.full_name.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        role: normalizedRole,
        staff_position: null,
        phone: data.phone ?? null,
        is_active: 1,
    }

    const [result] = await db.query('INSERT INTO users SET ?', insert)

    const [rows] = await db.query(
        `SELECT id, full_name, email, role, NULL AS staff_position, phone, is_active, created_at, updated_at
     FROM users WHERE id = ? LIMIT 1`,
        [result.insertId]
    )
    return rows?.[0]
}

async function deleteStaff(id) {
    const numId = Number(id)
    if (!numId) throw new ValidationError('Invalid user id')

    const [result] = await db.query(
        "DELETE FROM users WHERE id = ? AND role IN ('admin','manager','receptionist','housekeeper','maintenance','accountant')",
        [numId]
    )
    if (result.affectedRows === 0) throw new NotFoundError('Staff')

    return { id: numId }
}

async function setStaffActive(id, isActive) {
    const numId = Number(id)
    if (!numId) throw new ValidationError('Invalid user id')
    const active = Number(isActive) === 1 ? 1 : 0

    const [result] = await db.query(
        "UPDATE users SET is_active = ? WHERE id = ? AND role IN ('admin','manager','receptionist','housekeeper','maintenance','accountant')",
        [active, numId]
    )
    if (result.affectedRows === 0) throw new NotFoundError('Staff')

    const [rows] = await db.query(
        `SELECT id, full_name, email, role, NULL AS staff_position, phone, is_active, created_at, updated_at
     FROM users WHERE id = ? LIMIT 1`,
        [numId]
    )
    return rows?.[0]
}

module.exports = { getStaff, createStaff, deleteStaff, setStaffActive }
