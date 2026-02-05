const express = require('express')

const router = express.Router()

router.get('/', (_req, res) => {
  res.json({ message: 'Hotel Management System API' })
})

module.exports = router
