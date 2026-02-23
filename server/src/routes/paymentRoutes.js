const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/promptpay', paymentController.createPromptPayQR);

module.exports = router;