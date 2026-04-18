const express = require('express')

const router = express.Router()

/**
 * @swagger
 * /api:
 *   get:
 *     tags: [General]
 *     summary: API index
 *     description: Returns a welcome message confirming the API is running.
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hotel Management System API
 */
router.get('/', (_req, res) => {
  res.json({ message: 'Hotel Management System API' })
})

module.exports = router
