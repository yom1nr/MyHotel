const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

/**
 * @swagger
 * /api/payment/promptpay:
 *   post:
 *     tags: [Payment]
 *     summary: Create PromptPay QR code
 *     description: Generate a PromptPay QR code for payment via Omise payment gateway.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PromptPayRequest'
 *     responses:
 *       200:
 *         description: QR code generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 chargeId:
 *                   type: string
 *                 qrCodeUrl:
 *                   type: string
 *                   format: uri
 *       500:
 *         description: Payment gateway error
 */
router.post('/promptpay', paymentController.createPromptPayQR);

module.exports = router;