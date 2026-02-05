const db = require('../config/db')

async function getAllRooms(req, res) {
  try {
    const [rooms] = await db.query(
      `SELECT
        id,
        room_number,
        room_type,
        floor,
        capacity_adults,
        capacity_children,
        base_price,
        status,
        description,
        created_at,
        updated_at
      FROM rooms
      ORDER BY room_number ASC`
    )

    return res.json({ success: true, data: rooms })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to load rooms' })
  }
}

async function getPublicRooms(_req, res) {
  try {
    const [rooms] = await db.query(
      `SELECT
        id,
        room_number,
        room_type,
        floor,
        capacity_adults,
        capacity_children,
        base_price,
        status,
        description
      FROM rooms
      WHERE status = 'available'
      ORDER BY room_number ASC`
    )

    return res.json({ success: true, data: rooms })
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Failed to load rooms' })
  }
}

async function getRoomById(req, res) {
  try {
    const id = Number(req.params.id)
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid room id' })
    }

    const [rows] = await db.query(
      `SELECT
        id,
        room_number,
        room_type,
        floor,
        capacity_adults,
        capacity_children,
        base_price,
        status,
        description,
        created_at,
        updated_at
      FROM rooms
      WHERE id = ?
      LIMIT 1`,
      [id]
    )

    const room = rows?.[0]
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: 'Room not found' })
    }

    return res.json({ success: true, data: room })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to load room' })
  }
}

async function createRoom(req, res) {
  try {
    const {
      room_number,
      room_type,
      floor,
      capacity_adults,
      capacity_children,
      base_price,
      status,
      description,
    } = req.body || {}

    if (!room_number || base_price === undefined || base_price === null) {
      return res.status(400).json({
        success: false,
        message: 'room_number and base_price are required',
      })
    }

    const insert = {
      room_number,
      room_type: room_type || 'standard',
      floor: floor ?? null,
      capacity_adults: capacity_adults ?? 2,
      capacity_children: capacity_children ?? 0,
      base_price,
      status: status || 'available',
      description: description ?? null,
    }

    const [result] = await db.query('INSERT INTO rooms SET ?', insert)

    const id = result.insertId
    const [rows] = await db.query(
      'SELECT * FROM rooms WHERE id = ? LIMIT 1',
      [id]
    )

    return res.status(201).json({ success: true, data: rows?.[0] })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to create room' })
  }
}

async function updateRoom(req, res) {
  try {
    const id = Number(req.params.id)
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid room id' })
    }

    const allowed = [
      'room_number',
      'room_type',
      'floor',
      'capacity_adults',
      'capacity_children',
      'base_price',
      'status',
      'description',
    ]

    const updates = {}
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
        updates[key] = req.body[key]
      }
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'No fields to update' })
    }

    const [result] = await db.query('UPDATE rooms SET ? WHERE id = ?', [updates, id])

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Room not found' })
    }

    const [rows] = await db.query(
      'SELECT * FROM rooms WHERE id = ? LIMIT 1',
      [id]
    )

    return res.json({ success: true, data: rows?.[0] })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to update room' })
  }
}

async function deleteRoom(req, res) {
  try {
    const id = Number(req.params.id)
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid room id' })
    }

    const [result] = await db.query('DELETE FROM rooms WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Room not found' })
    }

    return res.json({ success: true, data: { id } })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to delete room' })
  }
}

module.exports = {
  getAllRooms,
  getPublicRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
}
