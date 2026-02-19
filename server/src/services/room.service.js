const db = require('../config/db')
const { NotFoundError, ValidationError } = require('../utils/AppError')

async function getAllRooms() {
    const [rows] = await db.query(
        `SELECT id, room_number, room_type, floor, capacity_adults, capacity_children,
            base_price, status, description, created_at, updated_at
     FROM rooms ORDER BY room_number ASC`
    )
    return rows
}

async function getPublicRooms() {
    const [rows] = await db.query(
        `SELECT id, room_number, room_type, floor, capacity_adults, capacity_children,
            base_price, status, description
     FROM rooms WHERE status = 'available' ORDER BY room_number ASC`
    )
    return rows
}

async function getRoomById(id) {
    const numId = Number(id)
    if (!numId) throw new ValidationError('Invalid room id')

    const [rows] = await db.query(
        `SELECT id, room_number, room_type, floor, capacity_adults, capacity_children,
            base_price, status, description, created_at, updated_at
     FROM rooms WHERE id = ? LIMIT 1`,
        [numId]
    )

    if (!rows?.[0]) throw new NotFoundError('Room')
    return rows[0]
}

async function createRoom(data) {
    const insert = {
        room_number: data.room_number,
        room_type: data.room_type || 'standard',
        floor: data.floor ?? null,
        capacity_adults: data.capacity_adults ?? 2,
        capacity_children: data.capacity_children ?? 0,
        base_price: data.base_price,
        status: data.status || 'available',
        description: data.description ?? null,
    }

    const [result] = await db.query('INSERT INTO rooms SET ?', insert)
    return getRoomById(result.insertId)
}

async function updateRoom(id, data) {
    const numId = Number(id)
    if (!numId) throw new ValidationError('Invalid room id')

    const allowed = ['room_number', 'room_type', 'floor', 'capacity_adults', 'capacity_children', 'base_price', 'status', 'description']
    const updates = {}
    for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(data, key)) updates[key] = data[key]
    }

    if (Object.keys(updates).length === 0) throw new ValidationError('No fields to update')

    const [result] = await db.query('UPDATE rooms SET ? WHERE id = ?', [updates, numId])
    if (result.affectedRows === 0) throw new NotFoundError('Room')

    return getRoomById(numId)
}

async function deleteRoom(id) {
    const numId = Number(id)
    if (!numId) throw new ValidationError('Invalid room id')

    const [result] = await db.query('DELETE FROM rooms WHERE id = ?', [numId])
    if (result.affectedRows === 0) throw new NotFoundError('Room')

    return { id: numId }
}

module.exports = { getAllRooms, getPublicRooms, getRoomById, createRoom, updateRoom, deleteRoom }
