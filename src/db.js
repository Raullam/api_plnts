// db.js
import mysql from 'mysql2' // Usamos mysql2 (sin promesas)
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER, DB_PORT } from './config.js'

// Crea el pool de conexiones (sin promesas)
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
})

// Exportamos el pool
export default pool // Exportamos directamente el pool
