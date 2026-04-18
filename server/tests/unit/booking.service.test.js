/**
 * Unit Tests — Booking Service
 *
 * ทดสอบ business logic ของ booking.service.js โดย mock database layer
 * เพื่อให้ test รันได้โดยไม่ต้องต่อ database จริง
 */

// ─── Mock DB ────────────────────────────────────────────────
const mockQuery = jest.fn()
const mockConnQuery = jest.fn()
const mockBeginTransaction = jest.fn()
const mockCommit = jest.fn()
const mockRollback = jest.fn()
const mockRelease = jest.fn()

const mockConnection = {
  query: mockConnQuery,
  beginTransaction: mockBeginTransaction,
  commit: mockCommit,
  rollback: mockRollback,
  release: mockRelease,
}

jest.mock('../../src/config/db', () => ({
  query: (...args) => mockQuery(...args),
  getConnection: () => Promise.resolve(mockConnection),
}))

// ─── Import after mock ─────────────────────────────────────
const bookingService = require('../../src/services/booking.service')
const { ValidationError, NotFoundError, AppError } = require('../../src/utils/AppError')

// ─── Helpers ────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks()
})

// ═══════════════════════════════════════════════════════════
// diffNights (exported indirectly — we test via createBooking behaviour)
// We can also test the logic by checking the nights field in responses.
// ═══════════════════════════════════════════════════════════

describe('Booking Service', () => {

  // ─────────────────────────────────────────────────────────
  // createBooking
  // ─────────────────────────────────────────────────────────
  describe('createBooking', () => {
    it('should throw ValidationError when room_id is missing', async () => {
      await expect(
        bookingService.createBooking({ check_in_date: '2026-05-01', check_out_date: '2026-05-03' }, 1)
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError when dates are missing', async () => {
      await expect(
        bookingService.createBooking({ room_id: 1 }, 1)
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError when check_out_date is before check_in_date', async () => {
      await expect(
        bookingService.createBooking({
          room_id: 1,
          check_in_date: '2026-05-05',
          check_out_date: '2026-05-03',
        }, 1)
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError when check_in and check_out are the same day', async () => {
      await expect(
        bookingService.createBooking({
          room_id: 1,
          check_in_date: '2026-05-01',
          check_out_date: '2026-05-01',
        }, 1)
      ).rejects.toThrow(ValidationError)
    })

    it('should throw NotFoundError when room does not exist', async () => {
      // db.query returns [[undefined]] — no room found
      mockQuery.mockResolvedValueOnce([[]])

      await expect(
        bookingService.createBooking({
          room_id: 999,
          check_in_date: '2026-05-01',
          check_out_date: '2026-05-03',
          guest_full_name: 'Test Guest',
        }, 1)
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw AppError 409 when room is not available', async () => {
      mockQuery.mockResolvedValueOnce([[{ id: 1, base_price: 1000, status: 'occupied' }]])

      await expect(
        bookingService.createBooking({
          room_id: 1,
          check_in_date: '2026-05-01',
          check_out_date: '2026-05-03',
          guest_full_name: 'Test Guest',
        }, 1)
      ).rejects.toThrow(AppError)

      try {
        mockQuery.mockResolvedValueOnce([[{ id: 1, base_price: 1000, status: 'reserved' }]])
        await bookingService.createBooking({
          room_id: 1,
          check_in_date: '2026-05-01',
          check_out_date: '2026-05-03',
          guest_full_name: 'Test Guest',
        }, 1)
      } catch (err) {
        expect(err.statusCode).toBe(409)
      }
    })

    it('should create booking successfully with correct calculated nights and amount', async () => {
      const room = { id: 1, base_price: 1500, status: 'available' }

      // 1st query: find room
      mockQuery.mockResolvedValueOnce([[room]])

      // Connection queries inside transaction
      mockConnQuery
        .mockResolvedValueOnce([{ insertId: 42 }])  // INSERT booking
        .mockResolvedValueOnce([{}])                  // UPDATE room status
        .mockResolvedValueOnce([{}])                  // INSERT transaction

      // Final query outside transaction: fetch created booking
      mockQuery.mockResolvedValueOnce([[{
        id: 42,
        booking_code: 'BK-TEST',
        room_number: '101',
        room_type: 'deluxe',
        nights: 2,
        total_amount: 3000,
        status: 'confirmed',
      }]])

      const result = await bookingService.createBooking({
        room_id: 1,
        check_in_date: '2026-05-01',
        check_out_date: '2026-05-03',
        guest_full_name: 'John Doe',
        guest_phone: '0812345678',
      }, 1)

      // Verify transaction flow
      expect(mockBeginTransaction).toHaveBeenCalledTimes(1)
      expect(mockCommit).toHaveBeenCalledTimes(1)
      expect(mockRollback).not.toHaveBeenCalled()
      expect(mockRelease).toHaveBeenCalledTimes(1)

      // Verify result
      expect(result).toBeDefined()
      expect(result.id).toBe(42)
      expect(result.status).toBe('confirmed')

      // Verify INSERT booking was called with correct amount (2 nights × 1500)
      const insertCall = mockConnQuery.mock.calls[0]
      expect(insertCall[1].total_amount).toBe(3000)
      expect(insertCall[1].nights).toBe(2)
      expect(insertCall[1].status).toBe('confirmed')
    })

    it('should rollback on error during transaction', async () => {
      const room = { id: 1, base_price: 1000, status: 'available' }
      mockQuery.mockResolvedValueOnce([[room]])

      // Simulate DB error during INSERT
      mockConnQuery.mockRejectedValueOnce(new Error('DB connection lost'))

      await expect(
        bookingService.createBooking({
          room_id: 1,
          check_in_date: '2026-05-01',
          check_out_date: '2026-05-02',
          guest_full_name: 'Test Guest',
        }, 1)
      ).rejects.toThrow('DB connection lost')

      expect(mockRollback).toHaveBeenCalledTimes(1)
      expect(mockRelease).toHaveBeenCalledTimes(1)
    })
  })

  // ─────────────────────────────────────────────────────────
  // createPublicBooking
  // ─────────────────────────────────────────────────────────
  describe('createPublicBooking', () => {
    it('should throw ValidationError when guest_name is missing', async () => {
      await expect(
        bookingService.createPublicBooking({
          room_id: 1,
          check_in_date: '2026-05-01',
          check_out_date: '2026-05-03',
          guest_phone: '0812345678',
        })
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError when guest_phone is missing', async () => {
      await expect(
        bookingService.createPublicBooking({
          room_id: 1,
          check_in_date: '2026-05-01',
          check_out_date: '2026-05-03',
          guest_name: 'John',
        })
      ).rejects.toThrow(ValidationError)
    })

    it('should create public booking with pending status', async () => {
      const room = { id: 1, base_price: 2000, status: 'available' }
      mockQuery.mockResolvedValueOnce([[room]])

      mockConnQuery
        .mockResolvedValueOnce([{ insertId: 10 }])  // INSERT booking
        .mockResolvedValueOnce([{}])                  // UPDATE room

      const result = await bookingService.createPublicBooking({
        room_id: 1,
        check_in_date: '2026-06-01',
        check_out_date: '2026-06-03',
        guest_name: 'สมชาย ใจดี',
        guest_phone: '0899999999',
      })

      expect(result).toHaveProperty('booking_code')
      expect(result.booking_code).toMatch(/^BK-/)

      // Verify the booking INSERT had status = 'pending'
      const insertCall = mockConnQuery.mock.calls[0]
      expect(insertCall[1].status).toBe('pending')
    })
  })

  // ─────────────────────────────────────────────────────────
  // updateBookingStatus
  // ─────────────────────────────────────────────────────────
  describe('updateBookingStatus', () => {
    it('should throw ValidationError when id is invalid', async () => {
      await expect(
        bookingService.updateBookingStatus('abc', 'checked_in')
      ).rejects.toThrow(ValidationError)
    })

    it('should throw NotFoundError when booking does not exist', async () => {
      mockQuery.mockResolvedValueOnce([[]])

      await expect(
        bookingService.updateBookingStatus(999, 'checked_in')
      ).rejects.toThrow(NotFoundError)
    })

    it('should set room to occupied on checked_in', async () => {
      const booking = { id: 1, room_id: 5, status: 'confirmed', total_amount: 3000 }
      mockQuery.mockResolvedValueOnce([[booking]])

      mockConnQuery
        .mockResolvedValueOnce([{}])  // UPDATE booking status
        .mockResolvedValueOnce([{}])  // UPDATE room to occupied

      mockQuery.mockResolvedValueOnce([[{ ...booking, status: 'checked_in' }]])

      const result = await bookingService.updateBookingStatus(1, 'checked_in')

      // Verify room was set to occupied
      const roomUpdateCall = mockConnQuery.mock.calls[1]
      expect(roomUpdateCall[0]).toContain('occupied')

      expect(result.status).toBe('checked_in')
    })

    it('should create refund transaction on cancellation', async () => {
      const booking = { id: 2, room_id: 3, status: 'confirmed', total_amount: 5000 }
      mockQuery.mockResolvedValueOnce([[booking]])

      mockConnQuery
        .mockResolvedValueOnce([{}])  // UPDATE booking status
        .mockResolvedValueOnce([{}])  // UPDATE room to available
        .mockResolvedValueOnce([{}])  // INSERT refund transaction

      mockQuery.mockResolvedValueOnce([[{ ...booking, status: 'cancelled' }]])

      await bookingService.updateBookingStatus(2, 'cancelled')

      // 3rd conn.query call should be the refund INSERT
      const refundCall = mockConnQuery.mock.calls[2]
      expect(refundCall[1].type).toBe('refund')
      expect(refundCall[1].amount).toBe(5000)
      expect(refundCall[1].reference_note).toContain('refund')
    })

    it('should charge remaining balance on checked_out', async () => {
      const booking = { id: 3, room_id: 7, status: 'checked_in', total_amount: 4000 }
      mockQuery.mockResolvedValueOnce([[booking]])

      mockConnQuery
        .mockResolvedValueOnce([{}])                          // UPDATE booking status
        .mockResolvedValueOnce([{}])                          // UPDATE room to available
        .mockResolvedValueOnce([[{ paidAmount: 2000 }]])      // SELECT paid amount
        .mockResolvedValueOnce([{}])                          // INSERT remaining payment

      mockQuery.mockResolvedValueOnce([[{ ...booking, status: 'checked_out' }]])

      await bookingService.updateBookingStatus(3, 'checked_out')

      // 4th conn.query call should be the remaining payment INSERT
      const paymentCall = mockConnQuery.mock.calls[3]
      expect(paymentCall[1].type).toBe('payment')
      expect(paymentCall[1].amount).toBe(2000) // 4000 - 2000 = 2000 remaining
    })

    it('should not create extra payment if fully paid on checked_out', async () => {
      const booking = { id: 4, room_id: 8, status: 'checked_in', total_amount: 3000 }
      mockQuery.mockResolvedValueOnce([[booking]])

      mockConnQuery
        .mockResolvedValueOnce([{}])                          // UPDATE booking status
        .mockResolvedValueOnce([{}])                          // UPDATE room to available
        .mockResolvedValueOnce([[{ paidAmount: 3000 }]])      // All paid

      mockQuery.mockResolvedValueOnce([[{ ...booking, status: 'checked_out' }]])

      await bookingService.updateBookingStatus(4, 'checked_out')

      // Should only have 3 conn.query calls (no extra payment INSERT)
      expect(mockConnQuery).toHaveBeenCalledTimes(3)
    })
  })

  // ─────────────────────────────────────────────────────────
  // getBookingByCode
  // ─────────────────────────────────────────────────────────
  describe('getBookingByCode', () => {
    it('should throw ValidationError when code is missing', async () => {
      await expect(
        bookingService.getBookingByCode('', '0812345678')
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError when phone is missing', async () => {
      await expect(
        bookingService.getBookingByCode('BK-TEST', '')
      ).rejects.toThrow(ValidationError)
    })

    it('should throw NotFoundError when booking not found', async () => {
      mockQuery.mockResolvedValueOnce([[]])

      await expect(
        bookingService.getBookingByCode('BK-INVALID', '0800000000')
      ).rejects.toThrow(NotFoundError)
    })

    it('should return booking details when found', async () => {
      const booking = {
        booking_code: 'BK-ABC123',
        guest_full_name: 'John',
        room_number: '101',
        status: 'confirmed',
      }
      mockQuery.mockResolvedValueOnce([[booking]])

      const result = await bookingService.getBookingByCode('BK-ABC123', '0812345678')
      expect(result).toEqual(booking)
    })
  })

  // ─────────────────────────────────────────────────────────
  // payDeposit
  // ─────────────────────────────────────────────────────────
  describe('payDeposit', () => {
    it('should throw ValidationError when code is missing', async () => {
      await expect(
        bookingService.payDeposit('', '0812345678')
      ).rejects.toThrow(ValidationError)
    })

    it('should throw NotFoundError when booking not found', async () => {
      mockQuery.mockResolvedValueOnce([[]])

      await expect(
        bookingService.payDeposit('BK-INVALID', '0800000000')
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw AppError when booking is not pending', async () => {
      mockQuery.mockResolvedValueOnce([[{ id: 1, total_amount: 4000, status: 'confirmed' }]])

      await expect(
        bookingService.payDeposit('BK-TEST', '0812345678')
      ).rejects.toThrow(AppError)
    })

    it('should pay 50% deposit and confirm booking', async () => {
      mockQuery.mockResolvedValueOnce([[{ id: 5, total_amount: 4000, status: 'pending' }]])

      mockConnQuery
        .mockResolvedValueOnce([{}])  // UPDATE booking to confirmed
        .mockResolvedValueOnce([{}])  // INSERT deposit transaction

      const result = await bookingService.payDeposit('BK-DEP', '0812345678')

      expect(result.success).toBe(true)
      expect(result.booking_id).toBe(5)

      // Verify deposit amount = 50% = 2000
      const txInsert = mockConnQuery.mock.calls[1]
      expect(txInsert[1].amount).toBe(2000)
      expect(txInsert[1].method).toBe('promptpay')
      expect(txInsert[1].reference_note).toContain('Deposit')
    })
  })

  // ─────────────────────────────────────────────────────────
  // getBookings
  // ─────────────────────────────────────────────────────────
  describe('getBookings', () => {
    it('should return array of bookings', async () => {
      const bookings = [
        { id: 1, booking_code: 'BK-1', status: 'confirmed' },
        { id: 2, booking_code: 'BK-2', status: 'checked_in' },
      ]
      mockQuery.mockResolvedValueOnce([bookings])

      const result = await bookingService.getBookings()
      expect(result).toEqual(bookings)
      expect(result).toHaveLength(2)
    })

    it('should return empty array when no bookings', async () => {
      mockQuery.mockResolvedValueOnce([[]])

      const result = await bookingService.getBookings()
      expect(result).toEqual([])
    })
  })
})
