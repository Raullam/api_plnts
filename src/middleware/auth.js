import jwt from 'jsonwebtoken'
import db from '../db.js' // Importa 'db' desde db.js

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Usamos db.query() con un callback
    db.query(
      'SELECT * FROM usuaris WHERE id = ?',
      [decoded.userId],
      (err, results) => {
        if (err) {
          console.error('🚨 Error al buscar usuario:', err)
          return res.status(500).json({ error: 'Error interno del servidor' })
        }

        if (results.length === 0) {
          return res.status(401).json({ error: 'Usuario no encontrado' })
        }

        req.user = results[0] // Guardamos el usuario en req.user
        next() // Pasamos al siguiente middleware
      },
    )
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

export default auth
