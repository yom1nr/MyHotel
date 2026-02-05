const db = require('../config/db')

function generateTransactionCode() {
  const ts = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `TR-${ts}-${rnd}`
}

async function getAllTransactions(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT
        t.id,
        t.booking_id,
        t.transaction_code,
        t.type,
        t.category,
        t.method,
        t.amount,
        t.status,
        t.transaction_date,
        t.reference_note,
        t.created_at,
        t.updated_at,
        b.booking_code,
        b.guest_full_name
      FROM transactions t
      LEFT JOIN bookings b ON b.id = t.booking_id
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT 500`
    )

    return res.json({ success: true, data: rows })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch transactions' })
  }
}

async function getTransactionById(req, res) {
  try {
    const id = Number(req.params.id)
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid transaction id' })
    }

    const [rows] = await db.query(
      `SELECT
        t.id,
        t.booking_id,
        t.transaction_code,
        t.type,
        t.category,
        t.method,
        t.amount,
        t.status,
        t.transaction_date,
        t.reference_note,
        t.created_at,
        t.updated_at,
        b.booking_code,
        b.guest_full_name
      FROM transactions t
      LEFT JOIN bookings b ON b.id = t.booking_id
      WHERE t.id = ?
      LIMIT 1`,
      [id]
    )

    const tx = rows?.[0]
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Not found' })
    }

    return res.json({ success: true, data: tx })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch transaction' })
  }
}

async function createTransaction(req, res) {
  try {
    const {
      booking_id,
      type,
      category,
      method,
      amount,
      status,
      transaction_date,
      reference_note,
    } = req.body || {}

    if (!type || typeof type !== 'string') {
      return res
        .status(400)
        .json({ success: false, message: 'type is required' })
    }

    const normalizedType = type.toLowerCase()
    const allowedTypes = new Set(['payment', 'refund', 'expense'])
    if (!allowedTypes.has(normalizedType)) {
      return res.status(400).json({ success: false, message: 'Invalid type' })
    }

    const amt = Number(amount)
    if (!Number.isFinite(amt) || amt < 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid amount' })
    }

    const insert = {
      booking_id: booking_id ? Number(booking_id) : null,
      transaction_code: generateTransactionCode(),
      type: normalizedType,
      category: category ?? null,
      method: method ?? 'cash',
      amount: amt,
      status: status ?? 'paid',
      transaction_date: transaction_date ?? undefined,
      reference_note: reference_note ?? null,
    }

    if (insert.transaction_date === undefined) {
      delete insert.transaction_date
    }

    const [result] = await db.query('INSERT INTO transactions SET ?', insert)

    const [rows] = await db.query(
      `SELECT
        t.id,
        t.booking_id,
        t.transaction_code,
        t.type,
        t.category,
        t.method,
        t.amount,
        t.status,
        t.transaction_date,
        t.reference_note,
        t.created_at,
        t.updated_at
      FROM transactions t
      WHERE t.id = ?
      LIMIT 1`,
      [result.insertId]
    )

    return res.status(201).json({ success: true, data: rows?.[0] })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to create transaction' })
  }
}

async function updateTransaction(req, res) {
  try {
    const id = Number(req.params.id)
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid transaction id' })
    }

    const allowed = [
      'booking_id',
      'type',
      'category',
      'method',
      'amount',
      'status',
      'transaction_date',
      'reference_note',
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

    if (updates.type) {
      const normalizedType = String(updates.type).toLowerCase()
      const allowedTypes = new Set(['payment', 'refund', 'expense'])
      if (!allowedTypes.has(normalizedType)) {
        return res.status(400).json({ success: false, message: 'Invalid type' })
      }
      updates.type = normalizedType
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'amount')) {
      const amt = Number(updates.amount)
      if (!Number.isFinite(amt) || amt < 0) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid amount' })
      }
      updates.amount = amt
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'booking_id')) {
      updates.booking_id = updates.booking_id ? Number(updates.booking_id) : null
    }

    const [result] = await db.query('UPDATE transactions SET ? WHERE id = ?', [
      updates,
      id,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Not found' })
    }

    const [rows] = await db.query(
      `SELECT
        t.id,
        t.booking_id,
        t.transaction_code,
        t.type,
        t.category,
        t.method,
        t.amount,
        t.status,
        t.transaction_date,
        t.reference_note,
        t.created_at,
        t.updated_at
      FROM transactions t
      WHERE t.id = ?
      LIMIT 1`,
      [id]
    )

    return res.json({ success: true, data: rows?.[0] })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to update transaction' })
  }
}

async function deleteTransaction(req, res) {
  try {
    const id = Number(req.params.id)
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid transaction id' })
    }

    const [result] = await db.query('DELETE FROM transactions WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Not found' })
    }

    return res.json({ success: true, data: { id } })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to delete transaction' })
  }
}

async function getFinancialReport(req, res) {
  try {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    const [rows] = await db.query(
      `SELECT
        DATE_FORMAT(transaction_date, '%Y-%m') AS ym,
        COALESCE(SUM(CASE WHEN type = 'payment' AND status = 'paid' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' AND status = 'paid' THEN amount ELSE 0 END), 0) AS expense
      FROM transactions
      WHERE transaction_date >= ?
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY ym ASC`,
      [start]
    )

    const byYm = new Map()
    for (const r of rows) {
      byYm.set(String(r.ym), {
        income: Number(r.income || 0),
        expense: Number(r.expense || 0),
      })
    }

    const monthlyData = []
    let totalIncome = 0
    let totalExpense = 0

    for (let i = 0; i < 6; i += 1) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1)
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const meta = byYm.get(ym) || { income: 0, expense: 0 }
      const profit = meta.income - meta.expense

      totalIncome += meta.income
      totalExpense += meta.expense

      const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d)
      monthlyData.push({
        month: monthLabel,
        income: meta.income,
        expense: meta.expense,
        profit,
      })
    }

    const netProfit = totalIncome - totalExpense

    return res.json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpense,
          netProfit,
        },
        monthlyData,
      },
    })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch financial report' })
  }
}

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getFinancialReport,
}
