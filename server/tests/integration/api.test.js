/**
 * Integration Tests — API Endpoints
 *
 * ใช้ Supertest ยิง request ผ่าน Express app โดยตรง
 * mock เฉพาะ database layer เท่านั้น — middleware, validation, routing ทำงานจริง
 */

// ─── Set test environment variables ────────────────────────
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing'
process.env.NODE_ENV = 'test'

const request = require('supertest')

// ─── Mock DB before requiring app ──────────────────────────
const mockQuery = jest.fn()
const mockConnQuery = jest.fn()

jest.mock('../../src/config/db', () => ({
  query: (...args) => mockQuery(...args),
  getConnection: () =>
    Promise.resolve({
      query: mockConnQuery,
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
    }),
  end: jest.fn(),
}))

// Mock uuid module (uses ESM exports incompatible with Jest CommonJS)
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}))

// Mock logger to suppress console output during tests
jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}))

const app = require('../../src/app')

beforeEach(() => {
  jest.clearAllMocks()
})

// ═══════════════════════════════════════════════════════════
// General Endpoints
// ═══════════════════════════════════════════════════════════
describe('General Endpoints', () => {
  describe('GET /health', () => {
    it('should return health check with status ok', async () => {
      const res = await request(app).get('/health')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('ok')
      expect(res.body.data).toHaveProperty('uptime')
      expect(res.body.data).toHaveProperty('timestamp')
    })
  })

  describe('GET /api', () => {
    it('should return API welcome message', async () => {
      const res = await request(app).get('/api')

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Hotel Management System API')
    })
  })

  describe('GET /api-docs.json', () => {
    it('should return OpenAPI specification', async () => {
      const res = await request(app).get('/api-docs.json')

      expect(res.status).toBe(200)
      expect(res.body.openapi).toBe('3.0.0')
      expect(res.body.info.title).toContain('MyHotel')
      expect(res.body.paths).toBeDefined()
    })
  })
})

// ═══════════════════════════════════════════════════════════
// Authentication
// ═══════════════════════════════════════════════════════════
describe('Authentication', () => {
  describe('POST /api/auth/login', () => {
    it('should return 400 when body is empty', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({})

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should return 400 when email format is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: 'test123' })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should return 400 when password is empty', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@hotel.com', password: '' })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })
  })
})

// ═══════════════════════════════════════════════════════════
// Protected Routes — Auth Middleware
// ═══════════════════════════════════════════════════════════
describe('Protected Routes', () => {
  describe('GET /api/bookings', () => {
    it('should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/bookings')

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('Unauthorized')
    })

    it('should return 401 when token is invalid', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', 'Bearer invalid-token-here')

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('should return 401 when Authorization header format is wrong', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', 'Token abc123')

      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/rooms', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/rooms')

      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/dashboard', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/dashboard')

      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/transactions', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/transactions')

      expect(res.status).toBe(401)
    })
  })
})

// ═══════════════════════════════════════════════════════════
// Public Endpoints
// ═══════════════════════════════════════════════════════════
describe('Public Endpoints', () => {
  describe('GET /api/public/rooms', () => {
    it('should return 200 with list of rooms', async () => {
      const rooms = [
        { id: 1, room_number: '101', room_type: 'standard', status: 'available', base_price: 1000 },
        { id: 2, room_number: '201', room_type: 'deluxe', status: 'available', base_price: 2000 },
      ]
      mockQuery.mockResolvedValueOnce([rooms])

      const res = await request(app).get('/api/public/rooms')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
    })
  })

  describe('POST /api/public/bookings', () => {
    it('should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/public/bookings')
        .send({})

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should create booking when all fields are provided', async () => {
      const room = { id: 1, base_price: 1500, status: 'available' }
      mockQuery.mockResolvedValueOnce([[room]])

      mockConnQuery
        .mockResolvedValueOnce([{ insertId: 10 }])
        .mockResolvedValueOnce([{}])

      const res = await request(app)
        .post('/api/public/bookings')
        .send({
          room_id: 1,
          check_in_date: '2026-06-01',
          check_out_date: '2026-06-03',
          guest_name: 'สมชาย ใจดี',
          guest_phone: '0812345678',
          guest_email: 'test@email.com',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('booking_code')
    })
  })

  describe('GET /api/bookings/status', () => {
    it('should return 400 when code is missing', async () => {
      const res = await request(app)
        .get('/api/bookings/status')
        .query({ phone: '0812345678' })

      expect(res.status).toBe(400)
    })

    it('should return 400 when phone is missing', async () => {
      const res = await request(app)
        .get('/api/bookings/status')
        .query({ code: 'BK-TEST' })

      expect(res.status).toBe(400)
    })

    it('should return 404 when booking not found', async () => {
      mockQuery.mockResolvedValueOnce([[]])

      const res = await request(app)
        .get('/api/bookings/status')
        .query({ code: 'BK-NOTEXIST', phone: '0800000000' })

      expect(res.status).toBe(404)
    })

    it('should return booking when found', async () => {
      const booking = {
        booking_code: 'BK-TEST',
        guest_full_name: 'John',
        room_number: '101',
        status: 'confirmed',
      }
      mockQuery.mockResolvedValueOnce([[booking]])

      const res = await request(app)
        .get('/api/bookings/status')
        .query({ code: 'BK-TEST', phone: '0812345678' })

      expect(res.status).toBe(200)
      expect(res.body.data.booking_code).toBe('BK-TEST')
    })
  })
})

// ═══════════════════════════════════════════════════════════
// Swagger Documentation
// ═══════════════════════════════════════════════════════════
describe('Swagger Documentation', () => {
  it('GET /api-docs should return Swagger UI HTML', async () => {
    const res = await request(app).get('/api-docs/')

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('text/html')
    expect(res.text).toContain('swagger')
  })
})
