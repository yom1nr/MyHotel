const express = require('express')

const { login } = require('../controllers/authController')
const validate = require('../middleware/validate')
const { loginSchema } = require('../validators/auth.schema')

const router = express.Router()

router.post('/login', validate(loginSchema), login)

module.exports = router
