import express from 'express'
import db from '../db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

import { OAuth2Client } from 'google-auth-library'
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

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

router.post('/login/google', async (req, res) => {
  const { idToken } = req.body

  if (!idToken) {
    return res.status(400).json({ error: 'Falta el ID Token de Google' })
  }

  try {
    // Verificar el ID Token con Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const email = payload.email
    const name = payload.name
    const picture = payload.picture

    // Buscar si el usuario ya existe en la base de datos
    const query = 'SELECT * FROM usuaris WHERE correu = ?'
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error('Error en la base de datos:', err)
        return res.status(500).json({ error: 'Error en la base de datos' })
      }

      let usuario
      if (results.length > 0) {
        usuario = results[0] // Usuario existente
      } else {
        // Si el usuario no existe, crearlo en la base de datos
        const insertQuery =
          'INSERT INTO usuaris (nom, correu, contrasenya, imatgePerfil) VALUES (?, ?, ?, ?)'
        db.query(insertQuery, [name, email, '', picture], (err, result) => {
          if (err) {
            console.error('Error al crear usuario:', err)
            return res.status(500).json({ error: 'Error al registrar usuario' })
          }
          usuario = {
            id: result.insertId,
            nom: name,
            correu: email,
            imatgePerfil: picture,
          }

          // Generar un token JWT propio
          const token = jwt.sign(
            { userId: usuario.id, email: usuario.correu },
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
          )

          res.json({ message: 'Login con Google exitoso', token, usuario })
        })
      }
    })
  } catch (error) {
    console.error('Error verificando el ID Token de Google:', error)
    return res.status(401).json({ error: 'Token de Google inválido' })
  }
})

// 🔹 Exportación correcta en ESM
export default router
