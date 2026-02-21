require('dotenv').config()

const bcrypt = require('bcrypt')
const db = require('./src/config/db')

async function seed() {
    console.log('🌱 Seeding database...\n')

    const conn = await db.getConnection()

    try {
        // Create tables if not exist (idempotent)
        await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(190) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin','staff','customer','manager','receptionist','housekeeper','maintenance','accountant') NOT NULL DEFAULT 'staff',
        staff_position ENUM('reception','housekeeper') NULL,
        phone VARCHAR(30) NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_users_email (email)
      ) ENGINE=InnoDB
    `)

        await conn.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        room_number VARCHAR(20) NOT NULL,
        room_type ENUM('standard','deluxe','suite') NOT NULL DEFAULT 'standard',
        floor INT NULL,
        capacity_adults INT NOT NULL DEFAULT 2,
        capacity_children INT NOT NULL DEFAULT 0,
        base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        status ENUM('available','occupied','reserved','maintenance') NOT NULL DEFAULT 'available',
        description TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_rooms_room_number (room_number),
        KEY idx_rooms_status (status),
        KEY idx_rooms_type (room_type)
      ) ENGINE=InnoDB
    `)

        await conn.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_code VARCHAR(30) NOT NULL,
        user_id BIGINT UNSIGNED NULL,
        guest_full_name VARCHAR(150) NOT NULL,
        guest_phone VARCHAR(30) NULL,
        guest_email VARCHAR(190) NULL,
        room_id BIGINT UNSIGNED NOT NULL,
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        nights INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        status ENUM('pending','confirmed','checked_in','checked_out','cancelled') NOT NULL DEFAULT 'pending',
        notes TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_bookings_code (booking_code),
        KEY idx_bookings_room_date (room_id, check_in_date, check_out_date),
        KEY idx_bookings_status (status),
        CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT fk_bookings_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `)

        await conn.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_id BIGINT UNSIGNED NULL,
        transaction_code VARCHAR(30) NOT NULL,
        type ENUM('payment','refund','expense') NOT NULL,
        category VARCHAR(80) NULL,
        method ENUM('cash','transfer','card','other') NOT NULL DEFAULT 'cash',
        amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        status ENUM('pending','paid','cancelled') NOT NULL DEFAULT 'paid',
        transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        reference_note VARCHAR(255) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_transactions_code (transaction_code),
        KEY idx_transactions_type (type),
        KEY idx_transactions_date (transaction_date),
        CONSTRAINT fk_transactions_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `)

        await conn.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        work_date DATE NOT NULL,
        clock_in_time DATETIME NOT NULL,
        clock_out_time DATETIME NULL,
        hours_worked DECIMAL(6,2) NULL,
        status ENUM('on_time','late') NOT NULL DEFAULT 'on_time',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_attendance_user_date (user_id, work_date),
        KEY idx_attendance_work_date (work_date),
        CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `)

        console.log('✅ Tables created\n')

        // Seed admin user
        const [[existingAdmin]] = await conn.query("SELECT id FROM users WHERE email = 'admin@hotel.com' LIMIT 1")
        if (!existingAdmin) {
            const hash = await bcrypt.hash('123456', 10)
            await conn.query('INSERT INTO users SET ?', {
                full_name: 'Admin',
                email: 'admin@hotel.com',
                password_hash: hash,
                role: 'admin',
                is_active: 1,
            })
            console.log('✅ Admin user created (admin@hotel.com / 123456)')
        } else {
            console.log('ℹ️  Admin user already exists')
        }

        // Seed receptionist
        const [[existingReceptionist]] = await conn.query("SELECT id FROM users WHERE email = 'reception@hotel.com' LIMIT 1")
        if (!existingReceptionist) {
            const hash = await bcrypt.hash('123456', 10)
            await conn.query('INSERT INTO users SET ?', {
                full_name: 'Reception Staff',
                email: 'reception@hotel.com',
                password_hash: hash,
                role: 'staff',
                staff_position: 'reception',
                is_active: 1,
            })
            console.log('✅ Receptionist created (reception@hotel.com / 123456)')
        }

        // Seed rooms
        const [[roomCount]] = await conn.query('SELECT COUNT(*) AS cnt FROM rooms')
        if (Number(roomCount.cnt) === 0) {
            const rooms = [
                { room_number: '101', room_type: 'standard', floor: 1, base_price: 1200, capacity_adults: 2, capacity_children: 1, description: 'Standard room with garden view' },
                { room_number: '102', room_type: 'standard', floor: 1, base_price: 1200, capacity_adults: 2, capacity_children: 1, description: 'Standard room with pool view' },
                { room_number: '201', room_type: 'deluxe', floor: 2, base_price: 2500, capacity_adults: 2, capacity_children: 2, description: 'Deluxe room with balcony' },
                { room_number: '202', room_type: 'deluxe', floor: 2, base_price: 2500, capacity_adults: 2, capacity_children: 2, description: 'Deluxe room with city view' },
                { room_number: '301', room_type: 'suite', floor: 3, base_price: 5000, capacity_adults: 4, capacity_children: 2, description: 'Premium suite with living area' },
                { room_number: '302', room_type: 'suite', floor: 3, base_price: 5000, capacity_adults: 4, capacity_children: 2, description: 'Premium suite with jacuzzi' },
                { room_number: '103', room_type: 'standard', floor: 1, base_price: 1500, capacity_adults: 2, capacity_children: 0, description: 'Standard quiet room' },
                { room_number: '203', room_type: 'deluxe', floor: 2, base_price: 3000, capacity_adults: 3, capacity_children: 1, description: 'Deluxe family room' },
            ]

            for (const room of rooms) {
                await conn.query('INSERT INTO rooms SET ?', { ...room, status: 'available' })
            }
            console.log(`✅ ${rooms.length} rooms created`)
        } else {
            console.log('ℹ️  Rooms already exist')
        }

        // Seed sample bookings
        const [[bookingCount]] = await conn.query('SELECT COUNT(*) AS cnt FROM bookings')
        if (Number(bookingCount.cnt) === 0) {
            const [[room101]] = await conn.query("SELECT id FROM rooms WHERE room_number = '101' LIMIT 1")
            const [[room201]] = await conn.query("SELECT id FROM rooms WHERE room_number = '201' LIMIT 1")

            if (room101 && room201) {
                const today = new Date()
                const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
                const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7)
                const nextWeekEnd = new Date(nextWeek); nextWeekEnd.setDate(nextWeek.getDate() + 3)

                await conn.query('INSERT INTO bookings SET ?', {
                    booking_code: 'BK-DEMO-001',
                    guest_full_name: 'John Smith',
                    guest_phone: '0891234567',
                    guest_email: 'john@example.com',
                    room_id: room101.id,
                    check_in_date: today.toISOString().slice(0, 10),
                    check_out_date: tomorrow.toISOString().slice(0, 10),
                    nights: 1,
                    total_amount: 1200,
                    status: 'confirmed',
                })

                await conn.query('INSERT INTO bookings SET ?', {
                    booking_code: 'BK-DEMO-002',
                    guest_full_name: 'Jane Doe',
                    guest_phone: '0899876543',
                    guest_email: 'jane@example.com',
                    room_id: room201.id,
                    check_in_date: nextWeek.toISOString().slice(0, 10),
                    check_out_date: nextWeekEnd.toISOString().slice(0, 10),
                    nights: 3,
                    total_amount: 7500,
                    status: 'pending',
                })

                // Update room status
                await conn.query("UPDATE rooms SET status = 'reserved' WHERE room_number IN ('101', '201')")

                // Add payment transactions
                await conn.query('INSERT INTO transactions SET ?', {
                    booking_id: null,
                    transaction_code: 'TX-DEMO-001',
                    type: 'payment',
                    method: 'transfer',
                    amount: 1200,
                    status: 'paid',
                    transaction_date: today,
                    reference_note: 'Booking BK-DEMO-001 payment',
                })

                await conn.query('INSERT INTO transactions SET ?', {
                    transaction_code: 'TX-DEMO-002',
                    type: 'expense',
                    category: 'Utilities',
                    method: 'transfer',
                    amount: 15000,
                    status: 'paid',
                    transaction_date: today,
                    reference_note: 'Monthly electricity bill',
                })

                await conn.query('INSERT INTO transactions SET ?', {
                    transaction_code: 'TX-DEMO-003',
                    type: 'expense',
                    category: 'Supplies',
                    method: 'cash',
                    amount: 3500,
                    status: 'paid',
                    transaction_date: today,
                    reference_note: 'Cleaning supplies',
                })

                console.log('✅ Sample bookings and transactions created')
            }
        } else {
            console.log('ℹ️  Bookings already exist')
        }

        console.log('\n🎉 Seed complete!')
    } catch (err) {
        console.error('❌ Seed failed:', err.message)
        throw err
    } finally {
        conn.release()
        await db.end()
    }
}

seed().catch(() => process.exit(1))
