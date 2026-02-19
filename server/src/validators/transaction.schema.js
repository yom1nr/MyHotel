const { z } = require('zod')

const createTransactionSchema = z.object({
    booking_id: z.number({ coerce: true }).int().positive().nullable().optional(),
    type: z.enum(['payment', 'refund', 'expense']),
    method: z.enum(['cash', 'transfer', 'card', 'other']),
    amount: z.number({ coerce: true }).positive('Amount must be positive'),
    description: z.string().nullable().optional(),
    status: z.enum(['pending', 'paid', 'cancelled']).default('pending'),
})

const updateTransactionSchema = createTransactionSchema.partial()

module.exports = { createTransactionSchema, updateTransactionSchema }
