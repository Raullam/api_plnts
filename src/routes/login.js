import express from 'express'
import db from '../db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: 'Faltan parámetros: email y password son necesarios' })
  }

  const query = 'SELECT * FROM usuaris WHERE correu = ?'
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Error en la consulta a la base de datos:', err)
      return res.status(500).json({ error: 'Error en la base de datos' })
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'Usuario no encontrado' })
    }

    const usuario = results[0]
    try {
      const passwordCorrecta = await bcrypt.compare(
        password,
        usuario.contrasenya,
      )
      if (!passwordCorrecta) {
        return res.status(400).json({ error: 'Contraseña incorrecta' })
      }

      const token = jwt.sign(
        { userId: usuario.id, email: usuario.correu },
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
      )

      console.log('TOKEN GENERADO:', token)
      return res.json({ message: 'Login exitoso', token, usuario })
    } catch (error) {
      console.error('Error al comparar la contraseña:', error)
      return res.status(500).json({ error: 'Error al procesar la contraseña' })
    }
  })
})

// 🔹 Exportación correcta en ESM
export default router
