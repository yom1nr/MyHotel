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

/**
 * @swagger
 * /api/users/staff:
 *   get:
 *     tags: [Staff Management]
 *     summary: Get all staff members
 *     description: Retrieve a list of all staff members. Requires admin role.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of staff
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Staff'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin only
 */
router.get('/staff', getStaff)

/**
 * @swagger
 * /api/users/staff:
 *   post:
 *     tags: [Staff Management]
 *     summary: Create a staff member
 *     description: Add a new staff member to the system. Requires admin role.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStaffRequest'
 *     responses:
 *       201:
 *         description: Staff created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Staff'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden — admin only
 */
router.post('/staff', validate(createUserSchema), createStaff)

/**
 * @swagger
 * /api/users/staff/{id}/active:
 *   patch:
 *     tags: [Staff Management]
 *     summary: Set staff active status
 *     description: Activate or deactivate a staff member. Requires admin role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [is_active]
 *             properties:
 *               is_active:
 *                 type: integer
 *                 enum: [0, 1]
 *                 example: 1
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Staff'
 *       404:
 *         description: Staff not found
 */
router.patch('/staff/:id/active', setStaffActive)

/**
 * @swagger
 * /api/users/staff/{id}:
 *   delete:
 *     tags: [Staff Management]
 *     summary: Delete a staff member
 *     description: Permanently remove a staff member from the system. Requires admin role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff user ID
 *     responses:
 *       200:
 *         description: Staff deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Staff not found
 */
router.delete('/staff/:id', deleteStaff)

module.exports = router
