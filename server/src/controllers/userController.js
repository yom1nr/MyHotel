const bcrypt = require('bcrypt')

const db = require('../config/db')

const ALLOWED_STAFF_ROLES = new Set([
  'admin',
  'manager',
  'receptionist',
  'housekeeper',
  'maintenance',
  'accountant',
])

async function getStaff(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT
        id,
        full_name,
        email,
        role,
        NULL AS staff_position,
        phone,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE role IN ('admin','manager','receptionist','housekeeper','maintenance','accountant')
      ORDER BY created_at DESC
      LIMIT 500`
    )

    return res.json({ success: true, data: rows })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch staff' })
  }
}

async function createStaff(req, res) {
  try {
    const { full_name, email, password, role, phone } = req.body || {}

    if (!full_name || typeof full_name !== 'string') {
      return res
        .status(400)
        .json({ success: false, message: 'full_name is required' })
    }

    if (!email || typeof email !== 'string') {
      return res
        .status(400)
        .json({ success: false, message: 'email is required' })
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'password is required (min 6 chars)',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const normalizedRole = role ? String(role).toLowerCase().trim() : ''
    if (!normalizedRole || !ALLOWED_STAFF_ROLES.has(normalizedRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role' })
    }

    const [[existing]] = await db.query(
      'SELECT id FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1',
      [normalizedEmail]
    )

    if (existing?.id) {
      return res
        .status(409)
        .json({ success: false, message: 'Email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const insert = {
      full_name: full_name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      role: normalizedRole,
      staff_position: null,
      phone: phone ?? null,
      is_active: 1,
    }

    const [result] = await db.query('INSERT INTO users SET ?', insert)

    const [rows] = await db.query(
      `SELECT
        id,
        full_name,
        email,
        role,
        NULL AS staff_position,
        phone,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
      LIMIT 1`,
      [result.insertId]
    )

    return res.status(201).json({ success: true, data: rows?.[0] })
  } catch (error) {
    const code = error?.code ? String(error.code) : ''
    const msg = error?.message ? String(error.message) : ''

    if (
      code === 'ER_WRONG_VALUE_FOR_TYPE' ||
      code === 'ER_DATA_TRUNCATED' ||
      msg.toLowerCase().includes('enum')
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid role value for database. Please update users.role ENUM to include: admin, manager, receptionist, housekeeper, maintenance, accountant.',
      })
    }

    if (code === 'ER_DUP_ENTRY') {
      return res
        .status(409)
        .json({ success: false, message: 'Email already exists' })
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create staff',
    })
  }
}

async function deleteStaff(req, res) {
  try {
    const id = Number(req.params.id)
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid user id' })
    }

    const [result] = await db.query(
      "DELETE FROM users WHERE id = ? AND role IN ('admin','manager','receptionist','housekeeper','maintenance','accountant')",
      [id]
    )

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Staff not found' })
    }

    return res.json({ success: true, data: { id } })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to delete staff' })
  }
}

async function setStaffActive(req, res) {
  try {
    const id = Number(req.params.id)
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid user id' })
    }

    const { is_active } = req.body || {}
    const active = Number(is_active) === 1 ? 1 : 0

    const [result] = await db.query(
      "UPDATE users SET is_active = ? WHERE id = ? AND role IN ('admin','manager','receptionist','housekeeper','maintenance','accountant')",
      [active, id]
    )

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Staff not found' })
    }

    const [rows] = await db.query(
      `SELECT
        id,
        full_name,
        email,
        role,
        NULL AS staff_position,
        phone,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
      LIMIT 1`,
      [id]
    )

    return res.json({ success: true, data: rows?.[0] })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to update staff' })
  }
}

module.exports = {
  getStaff,
  createStaff,
  deleteStaff,
  setStaffActive,
}
