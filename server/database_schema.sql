
  CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(190) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin','staff','customer') NOT NULL DEFAULT 'staff',
    staff_position ENUM('reception','housekeeper') NULL,
    phone VARCHAR(30) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
  ) ENGINE=InnoDB;

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
  ) ENGINE=InnoDB;

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
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_room FOREIGN KEY (room_id) REFERENCES rooms(id)
      ON DELETE RESTRICT ON UPDATE CASCADE
  ) ENGINE=InnoDB;

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
    CONSTRAINT fk_transactions_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
      ON DELETE SET NULL ON UPDATE CASCADE
  ) ENGINE=InnoDB;

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
    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB;
