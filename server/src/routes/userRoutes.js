const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const adminOnlyMiddleware = require('../middleware/adminOnlyMiddleware')
const validate = require('../middleware/validate')
const { createUserSchema } = require('../validators/user.schema')
const {
  getStaff,
  createStaff,
  deleteStaff,
  setStaffActive,
} = require('../controllers/userController')

const router = express.Router()

router.use(authMiddleware)
router.use(adminOnlyMiddleware)

router.get('/staff', getStaff)
router.post('/staff', validate(createUserSchema), createStaff)
router.patch('/staff/:id/active', setStaffActive)
router.delete('/staff/:id', deleteStaff)

module.exports = router
