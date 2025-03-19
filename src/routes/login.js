import express from 'express'
import db from '../db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { OAuth2Client } from 'google-auth-library'

dotenv.config()

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const router = express.Router()

// Función para envolver las consultas en promesas
const queryPromise = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results)
      }
    })
  })
}

// Ruta de login normal
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: 'Faltan parámetros: email y password son necesarios' })
  }

  try {
    const results = await queryPromise(
      'SELECT * FROM usuaris WHERE correu = ?',
      [email],
    )

    if (results.length === 0) {
      return res.status(400).json({ error: 'Usuario no encontrado' })
    }

    const usuario = results[0]
    const passwordCorrecta = await bcrypt.compare(password, usuario.contrasenya)

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
    console.error('Error en la base de datos:', error)
    return res.status(500).json({ error: 'Error en la base de datos' })
  }
})

// Ruta de login con Google
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
    const results = await queryPromise(
      'SELECT * FROM usuaris WHERE correu = ?',
      [email],
    )

    let usuario
    if (results.length > 0) {
      usuario = results[0] // Usuario existente
    } else {
      // Si el usuario no existe, crearlo en la base de datos
      const insertQuery =
        'INSERT INTO usuaris (nom, correu, contrasenya, imatgePerfil) VALUES (?, ?, ?, ?)'
      const insertResult = await queryPromise(insertQuery, [
        name,
        email,
        '',
        picture,
      ])

      usuario = {
        id: insertResult.insertId,
        nom: name,
        correu: email,
        imatgePerfil: picture,
      }
    }

    // Generar un token JWT propio
    const token = jwt.sign(
      { userId: usuario.id, email: usuario.correu },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    )

    res.json({ message: 'Login con Google exitoso', token, usuario })
  } catch (error) {
    console.error('Error verificando el ID Token de Google:', error)
    return res.status(401).json({ error: 'Token de Google inválido' })
  }
})

export default router
