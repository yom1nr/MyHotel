const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const adminOnlyMiddleware = require('../middleware/adminOnlyMiddleware')
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
router.post('/staff', createStaff)
router.patch('/staff/:id/active', setStaffActive)
router.delete('/staff/:id', deleteStaff)

module.exports = router
