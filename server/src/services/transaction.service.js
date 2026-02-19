const db = require('../config/db')
const { NotFoundError, ValidationError } = require('../utils/AppError')

function generateTransactionCode() {
    const ts = Date.now().toString(36).toUpperCase()
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `TX-${ts}-${rand}`
}

async function getAllTransactions() {
    const [rows] = await db.query(
        `SELECT id, booking_id, transaction_code, type, category, method,
            amount, status, transaction_date, reference_note, created_at, updated_at
     FROM transactions ORDER BY transaction_date DESC LIMIT 500`
    )
    return rows
}

async function getTransactionById(id) {
    const numId = Number(id)
    if (!numId) throw new ValidationError('Invalid transaction id')

    const [rows] = await db.query('SELECT * FROM transactions WHERE id = ? LIMIT 1', [numId])
    if (!rows?.[0]) throw new NotFoundError('Transaction')
    return rows[0]
}

async function createTransaction(data) {
    const txCode = generateTransactionCode()

    const insert = {
        booking_id: data.booking_id || null,
        transaction_code: txCode,
        type: data.type,
        category: data.category || null,
        method: data.method || 'cash',
        amount: data.amount,
        status: data.status || 'paid',
        transaction_date: new Date(),
        reference_note: data.reference_note || null,
    }

    const [result] = await db.query('INSERT INTO transactions SET ?', insert)
    return getTransactionById(result.insertId)
}

async function updateTransaction(id, data) {
    const numId = Number(id)
    if (!numId) throw new ValidationError('Invalid transaction id')

    const allowed = ['type', 'category', 'method', 'amount', 'status', 'reference_note']
    const updates = {}
    for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(data, key)) updates[key] = data[key]
    }
    if (Object.keys(updates).length === 0) throw new ValidationError('No fields to update')

    const [result] = await db.query('UPDATE transactions SET ? WHERE id = ?', [updates, numId])
    if (result.affectedRows === 0) throw new NotFoundError('Transaction')

    return getTransactionById(numId)
}

async function deleteTransaction(id) {
    const numId = Number(id)
    if (!numId) throw new ValidationError('Invalid transaction id')

    const [result] = await db.query('DELETE FROM transactions WHERE id = ?', [numId])
    if (result.affectedRows === 0) throw new NotFoundError('Transaction')

    return { id: numId }
}

async function getFinancialReport() {
    const [[summary]] = await db.query(
        `SELECT
       COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) AS totalIncome,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpense
     FROM transactions WHERE status = 'paid'`
    )

    const totalIncome = Number(summary?.totalIncome || 0)
    const totalExpense = Number(summary?.totalExpense || 0)

    const [monthlyRows] = await db.query(
        `SELECT
       DATE_FORMAT(transaction_date, '%Y-%m') AS month,
       COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) AS income,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
     FROM transactions WHERE status = 'paid'
       AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
     GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
     ORDER BY month ASC`
    )

    const monthlyData = monthlyRows.map((r) => ({
        month: r.month,
        income: Number(r.income || 0),
        expense: Number(r.expense || 0),
        profit: Number(r.income || 0) - Number(r.expense || 0),
    }))

    return {
        summary: { totalIncome, totalExpense, netProfit: totalIncome - totalExpense },
        monthlyData,
    }
}

module.exports = { getAllTransactions, getTransactionById, createTransaction, updateTransaction, deleteTransaction, getFinancialReport }
