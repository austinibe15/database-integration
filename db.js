// db.js (slightly enhanced)
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Return both rows and fields for flexibility (optional)
async function query(sql, params) {
  const [rows, fields] = await pool.execute(sql, params);
  return [rows, fields];
}

module.exports = { query };