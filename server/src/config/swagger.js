const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MyHotel — Hotel Management System API',
      description:
        'REST API documentation for the MyHotel management system.\n\n' +
        '## Authentication\n' +
        'Most endpoints require a **Bearer Token** (JWT). ' +
        'Obtain a token via `POST /api/auth/login`, then click **Authorize** above and enter:\n' +
        '```\nBearer <your_token>\n```',
      version: '1.0.0',
      contact: {
        name: 'MyHotel Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // ─── Common ────────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Success' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            code: { type: 'string' },
          },
        },

        // ─── Auth ──────────────────────────────────────
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@hotel.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                full_name: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
              },
            },
          },
        },

        // ─── Room ──────────────────────────────────────
        Room: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            room_number: { type: 'string', example: '101' },
            room_type: { type: 'string', enum: ['standard', 'deluxe', 'suite'], example: 'deluxe' },
            floor: { type: 'integer', example: 1 },
            capacity_adults: { type: 'integer', example: 2 },
            capacity_children: { type: 'integer', example: 1 },
            base_price: { type: 'number', example: 1500 },
            status: { type: 'string', enum: ['available', 'reserved', 'occupied', 'maintenance'], example: 'available' },
            description: { type: 'string', nullable: true },
          },
        },
        CreateRoomRequest: {
          type: 'object',
          required: ['room_number', 'room_type', 'base_price'],
          properties: {
            room_number: { type: 'string', example: '201' },
            room_type: { type: 'string', enum: ['standard', 'deluxe', 'suite'] },
            floor: { type: 'integer', example: 2 },
            capacity_adults: { type: 'integer', example: 2 },
            capacity_children: { type: 'integer', example: 0 },
            base_price: { type: 'number', example: 2000 },
            description: { type: 'string', nullable: true },
          },
        },

        // ─── Booking ───────────────────────────────────
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            booking_code: { type: 'string', example: 'BK-ABC123-XY12' },
            guest_full_name: { type: 'string', example: 'John Doe' },
            guest_phone: { type: 'string', example: '0812345678' },
            guest_email: { type: 'string', nullable: true },
            room_id: { type: 'integer' },
            room_number: { type: 'string' },
            room_type: { type: 'string' },
            check_in_date: { type: 'string', format: 'date', example: '2026-05-01' },
            check_out_date: { type: 'string', format: 'date', example: '2026-05-03' },
            nights: { type: 'integer', example: 2 },
            total_amount: { type: 'number', example: 3000 },
            status: { type: 'string', enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'] },
            paid_amount: { type: 'number' },
            notes: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        CreateBookingRequest: {
          type: 'object',
          required: ['room_id', 'check_in_date', 'check_out_date', 'guest_full_name'],
          properties: {
            room_id: { type: 'integer', example: 1 },
            check_in_date: { type: 'string', format: 'date', example: '2026-05-01' },
            check_out_date: { type: 'string', format: 'date', example: '2026-05-03' },
            guest_full_name: { type: 'string', example: 'John Doe' },
            guest_phone: { type: 'string', example: '0812345678' },
            guest_email: { type: 'string', format: 'email' },
            notes: { type: 'string' },
          },
        },
        UpdateBookingStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'] },
            paymentMethod: { type: 'string', enum: ['cash', 'transfer', 'card', 'promptpay'] },
          },
        },
        PublicBookingRequest: {
          type: 'object',
          required: ['room_id', 'check_in_date', 'check_out_date', 'guest_name', 'guest_phone'],
          properties: {
            room_id: { type: 'integer', example: 1 },
            check_in_date: { type: 'string', format: 'date', example: '2026-05-01' },
            check_out_date: { type: 'string', format: 'date', example: '2026-05-03' },
            guest_name: { type: 'string', example: 'สมชาย ใจดี' },
            guest_phone: { type: 'string', example: '0812345678' },
            guest_email: { type: 'string', format: 'email' },
          },
        },

        // ─── Transaction ───────────────────────────────
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            transaction_code: { type: 'string' },
            booking_id: { type: 'integer', nullable: true },
            type: { type: 'string', enum: ['payment', 'refund', 'expense'] },
            method: { type: 'string', enum: ['cash', 'transfer', 'card', 'promptpay', 'other'] },
            amount: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'paid', 'cancelled'] },
            description: { type: 'string', nullable: true },
            transaction_date: { type: 'string', format: 'date-time' },
          },
        },
        CreateTransactionRequest: {
          type: 'object',
          required: ['type', 'method', 'amount'],
          properties: {
            booking_id: { type: 'integer', nullable: true },
            type: { type: 'string', enum: ['payment', 'refund', 'expense'] },
            method: { type: 'string', enum: ['cash', 'transfer', 'card', 'promptpay', 'other'] },
            amount: { type: 'number', example: 1500 },
            description: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
          },
        },

        // ─── User / Staff ──────────────────────────────
        Staff: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            full_name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'manager', 'receptionist', 'housekeeper', 'maintenance', 'accountant'] },
            staff_position: { type: 'string', nullable: true },
            phone: { type: 'string', nullable: true },
            is_active: { type: 'integer', enum: [0, 1] },
          },
        },
        CreateStaffRequest: {
          type: 'object',
          required: ['full_name', 'email', 'password', 'role'],
          properties: {
            full_name: { type: 'string', example: 'สมหญิง รักงาน' },
            email: { type: 'string', format: 'email', example: 'staff@hotel.com' },
            password: { type: 'string', minLength: 6, example: 'pass1234' },
            role: { type: 'string', enum: ['admin', 'manager', 'receptionist', 'housekeeper', 'maintenance', 'accountant'] },
            staff_position: { type: 'string' },
            phone: { type: 'string' },
          },
        },

        // ─── Attendance ────────────────────────────────
        Attendance: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            full_name: { type: 'string' },
            clock_in: { type: 'string', format: 'date-time' },
            clock_out: { type: 'string', format: 'date-time', nullable: true },
            date: { type: 'string', format: 'date' },
          },
        },

        // ─── Payment ───────────────────────────────────
        PromptPayRequest: {
          type: 'object',
          required: ['amount', 'bookingId'],
          properties: {
            amount: { type: 'number', example: 1500 },
            bookingId: { type: 'integer', example: 1 },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = swaggerSpec
