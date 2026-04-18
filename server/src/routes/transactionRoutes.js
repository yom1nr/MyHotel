const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const validate = require('../middleware/validate')
const { createTransactionSchema, updateTransactionSchema } = require('../validators/transaction.schema')
const {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController')

const router = express.Router()

router.use(authMiddleware)

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: Get all transactions
 *     description: Retrieve all financial transactions (payments, refunds, expenses).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized
 */
router.get('/', getAllTransactions)

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Get transaction by ID
 *     description: Retrieve a single transaction by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 */
router.get('/:id', getTransactionById)

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     tags: [Transactions]
 *     summary: Create a transaction
 *     description: Manually create a financial transaction (payment, refund, or expense).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionRequest'
 *     responses:
 *       201:
 *         description: Transaction created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Validation error
 */
router.post('/', validate(createTransactionSchema), createTransaction)

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     tags: [Transactions]
 *     summary: Update a transaction
 *     description: Update a transaction's details.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionRequest'
 *     responses:
 *       200:
 *         description: Transaction updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 */
router.put('/:id', validate(updateTransactionSchema), updateTransaction)

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     tags: [Transactions]
 *     summary: Delete a transaction
 *     description: Permanently delete a transaction.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Transaction not found
 */
router.delete('/:id', deleteTransaction)

module.exports = router
