const { z } = require('zod')

const createUserSchema = z.object({
    full_name: z.string().min(1, 'Full name is required').transform((v) => v.trim()),
    email: z.string().email('Invalid email format').transform((v) => v.trim().toLowerCase()),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'manager', 'receptionist', 'housekeeper', 'maintenance', 'accountant']),
    staff_position: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
})

const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
    password: z.string().min(6).optional(),
    is_active: z.number({ coerce: true }).min(0).max(1).optional(),
})

module.exports = { createUserSchema, updateUserSchema }
