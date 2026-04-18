# Walkthrough: Swagger API Docs + Unit/Integration Tests

## สรุปสิ่งที่ทำ

เพิ่มความสมบูรณ์ให้โปรเจค MyHotel ตามข้อเสนอแนะของอาจารย์ 2 ส่วนหลัก + แก้ bug 1 จุด

---

## 1. Swagger API Documentation (30 endpoints)

เปิดใช้งานได้ที่: **`http://localhost:5000/api-docs`**

### ไฟล์ที่เพิ่ม/แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| [swagger.js](file:///d:/testmyhotel/server/src/config/swagger.js) | **[NEW]** OpenAPI 3.0 config + component schemas ทั้งหมด |
| [app.js](file:///d:/testmyhotel/server/src/app.js) | เพิ่ม Swagger UI middleware ที่ `/api-docs` |
| [authRoutes.js](file:///d:/testmyhotel/server/src/routes/authRoutes.js) | เพิ่ม `@swagger` annotations |
| [roomRoutes.js](file:///d:/testmyhotel/server/src/routes/roomRoutes.js) | เพิ่ม `@swagger` annotations (5 endpoints) |
| [bookingRoutes.js](file:///d:/testmyhotel/server/src/routes/bookingRoutes.js) | เพิ่ม `@swagger` annotations (4 endpoints) |
| [publicBookingRoutes.js](file:///d:/testmyhotel/server/src/routes/publicBookingRoutes.js) | เพิ่ม `@swagger` annotations (2 endpoints) |
| [publicRoomRoutes.js](file:///d:/testmyhotel/server/src/routes/publicRoomRoutes.js) | เพิ่ม `@swagger` annotations |
| [transactionRoutes.js](file:///d:/testmyhotel/server/src/routes/transactionRoutes.js) | เพิ่ม `@swagger` annotations (5 endpoints) |
| [dashboardRoutes.js](file:///d:/testmyhotel/server/src/routes/dashboardRoutes.js) | เพิ่ม `@swagger` annotations |
| [reportRoutes.js](file:///d:/testmyhotel/server/src/routes/reportRoutes.js) | เพิ่ม `@swagger` annotations |
| [userRoutes.js](file:///d:/testmyhotel/server/src/routes/userRoutes.js) | เพิ่ม `@swagger` annotations (4 endpoints) |
| [attendanceRoutes.js](file:///d:/testmyhotel/server/src/routes/attendanceRoutes.js) | เพิ่ม `@swagger` annotations (4 endpoints) |
| [paymentRoutes.js](file:///d:/testmyhotel/server/src/routes/paymentRoutes.js) | เพิ่ม `@swagger` annotations |
| [index.js](file:///d:/testmyhotel/server/src/routes/index.js) | เพิ่ม `@swagger` annotations |

### Tags จัดกลุ่ม
- **General** — API index
- **Authentication** — Login
- **Rooms** — CRUD ห้องพัก (protected)
- **Bookings** — จัดการการจอง (protected)
- **Public Booking** — จองห้องจากหน้าเว็บ (public)
- **Public Rooms** — ดูห้องว่าง (public)
- **Transactions** — CRUD รายการเงิน
- **Dashboard** — ข้อมูลสรุป
- **Reports** — รายงานการเงิน
- **Staff Management** — จัดการพนักงาน (admin only)
- **Attendance** — ลงเวลาเข้า-ออก
- **Payment** — PromptPay QR

---

## 2. Unit & Integration Tests (47 tests)

### คำสั่งรัน
```bash
cd server
npm test                   # รันทั้งหมด
npm run test:coverage      # รันพร้อม coverage report
```

### Unit Tests — [booking.service.test.js](file:///d:/testmyhotel/server/tests/unit/booking.service.test.js)
**27 test cases** ครอบคลุม business logic ทั้งหมด:

| กลุ่ม | จำนวน | ทดสอบ |
|---|---|---|
| createBooking | 8 | validation, room check, transaction flow, rollback |
| createPublicBooking | 3 | validation, pending status |
| updateBookingStatus | 5 | checked_in, cancelled (refund), checked_out (remaining balance) |
| getBookingByCode | 4 | validation, not found, success |
| payDeposit | 4 | validation, 50% deposit calculation |
| getBookings | 2 | array return, empty |

### Integration Tests — [api.test.js](file:///d:/testmyhotel/server/tests/integration/api.test.js)
**20 test cases** ใช้ Supertest ยิง request ผ่าน Express app:

| กลุ่ม | จำนวน | ทดสอบ |
|---|---|---|
| General Endpoints | 3 | health, API index, OpenAPI spec |
| Authentication | 3 | validation (empty body, bad email, empty password) |
| Protected Routes | 6 | 401 unauthorized (no token, bad token, wrong format) |
| Public Endpoints | 8 | rooms list, booking creation, status lookup |
| Swagger Docs | 1 | UI accessibility |

---

## 3. Bug Fix: Zod v4 Compatibility

> [!IMPORTANT]
> ระหว่างเขียน test พบ bug ใน `validate.js` — Zod v4 ใช้ `.issues` แทน `.errors` ทำให้ validation middleware crash เป็น 500 แทน 400

```diff:validate.js
const { ZodError } = require('zod')
const { ValidationError } = require('../utils/AppError')

function validate(schema) {
    return (req, _res, next) => {
        try {
            req.body = schema.parse(req.body)
            next()
        } catch (err) {
            if (err instanceof ZodError) {
                const details = err.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }))
                return next(new ValidationError('Validation failed', details))
            }
            next(err)
        }
    }
}

module.exports = validate
===
const { ZodError } = require('zod')
const { ValidationError } = require('../utils/AppError')

function validate(schema) {
    return (req, _res, next) => {
        try {
            req.body = schema.parse(req.body)
            next()
        } catch (err) {
        if (err instanceof ZodError) {
                const zodIssues = err.issues || err.errors || []
                const details = zodIssues.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }))
                return next(new ValidationError('Validation failed', details))
            }
            next(err)
        }
    }
}

module.exports = validate
```

---

## Dependencies ที่เพิ่ม

| Package | Type | Purpose |
|---|---|---|
| `swagger-jsdoc` | production | สร้าง OpenAPI spec จาก JSDoc |
| `swagger-ui-express` | production | Serve Swagger UI หน้าเว็บ |
| `jest` | dev | Test runner |
| `supertest` | dev | HTTP integration testing |

---

## ผลลัพธ์ Test

```
Test Suites: 2 passed, 2 total
Tests:       47 passed, 47 total
Time:        2.648 s
```

✅ ทุก test ผ่านหมด
