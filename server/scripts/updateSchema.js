require('dotenv').config()
const mysql = require('mysql2/promise')

async function updateSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'testmyhotel',
        port: Number(process.env.DB_PORT) || 3306
    })

    try {
        console.log('Altering transactions table...')
        await connection.query(`
      ALTER TABLE transactions 
      MODIFY COLUMN method ENUM('cash', 'transfer', 'card', 'promptpay', 'other') NOT NULL
    `)
        console.log('Successfully updated transactions method ENUM.')
    } catch (err) {
        console.error('Error updating schema:', err)
    } finally {
        connection.end()
    }
}

updateSchema()
