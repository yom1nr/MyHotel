const { z } = require('zod')

const createBookingSchema = z.object({
    room_id: z.number({ coerce: true }).int().positive('room_id is required'),
    check_in_date: z.string().min(1, 'check_in_date is required'),
    check_out_date: z.string().min(1, 'check_out_date is required'),
    guest_full_name: z.string().min(1, 'Guest name is required').transform((v) => v.trim()),
    guest_phone: z.string().nullable().optional(),
    guest_email: z.string().email().nullable().optional().or(z.literal('')),
    notes: z.string().nullable().optional(),
})

const updateBookingStatusSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']),
    paymentMethod: z.enum(['cash', 'transfer', 'card', 'promptpay']).optional(),
})

module.exports = { createBookingSchema, updateBookingStatusSchema }
