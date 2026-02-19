const { z } = require('zod')

const createRoomSchema = z.object({
    room_number: z.string().min(1, 'Room number is required').transform((v) => v.trim()),
    room_type: z.enum(['standard', 'deluxe', 'suite']),
    floor: z.number({ coerce: true }).int().min(1).optional(),
    capacity_adults: z.number({ coerce: true }).int().min(1).default(2),
    capacity_children: z.number({ coerce: true }).int().min(0).default(0),
    base_price: z.number({ coerce: true }).positive('Price must be positive'),
    description: z.string().nullable().optional(),
})

const updateRoomSchema = createRoomSchema.partial()

module.exports = { createRoomSchema, updateRoomSchema }
