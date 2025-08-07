import express from 'express'
import db from '../db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { OAuth2Client } from 'google-auth-library'
import fetch from 'node-fetch' // Necesario para llamar a la API de Google

dotenv.config()

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación de usuarios
 */

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

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login tradicional con email y contraseña
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login exitoso
 *       400:
 *         description: Email o contraseña incorrectos
 *       500:
 *         description: Error en la base de datos
 */

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

/**
 * @swagger
 * /login/google:
 *   post:
 *     summary: Login usando Google ID Token o Access Token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google ID Token (preferido)
 *               accessToken:
 *                 type: string
 *                 description: Google Access Token (fallback para móvil web)
 *     responses:
 *       200:
 *         description: Login con Google exitoso
 *       400:
 *         description: Falta el ID Token o Access Token
 *       401:
 *         description: Token de Google inválido
 */

// Función para obtener información del usuario usando Access Token
async function getUserInfoFromAccessToken(accessToken) {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`,
  )

  if (!response.ok) {
    throw new Error('Error al obtener información del usuario con Access Token')
  }

  const userInfo = await response.json()
  return {
    email: userInfo.email,
    name: userInfo.name,
    picture: userInfo.picture,
  }
}

// Ruta de login con Google - ACTUALIZADA para soportar tanto idToken como accessToken
router.post('/login/google', async (req, res) => {
  const { idToken, accessToken } = req.body

  if (!idToken && !accessToken) {
    return res.status(400).json({
      error: 'Falta el ID Token o Access Token de Google',
      details:
        'Debe proporcionar idToken (preferido) o accessToken como fallback',
    })
  }

  try {
    let email, name, picture

    // Priorizar idToken si está disponible
    if (idToken) {
      console.log('🔑 Usando ID Token para autenticación')

      // Verificar el ID Token con Google
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      })

      const payload = ticket.getPayload()
      email = payload.email
      name = payload.name
      picture = payload.picture
    } else if (accessToken) {
      console.log('🔑 Usando Access Token para autenticación (fallback)')

      // Usar Access Token para obtener información del usuario
      const userInfo = await getUserInfoFromAccessToken(accessToken)
      email = userInfo.email
      name = userInfo.name
      picture = userInfo.picture
    }

    console.log('✅ Información obtenida de Google:', { email, name })

    // Buscar si el usuario ya existe en la base de datos
    const results = await queryPromise(
      'SELECT * FROM usuaris WHERE correu = ?',
      [email],
    )

    let usuario
    if (results.length > 0) {
      usuario = results[0] // Usuario existente
      console.log('👤 Usuario existente encontrado:', usuario.correu)
    } else {
      // Si el usuario no existe, crearlo en la base de datos
      console.log('🆕 Creando nuevo usuario:', email)
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

    console.log('🎉 Login con Google exitoso para:', email)
    res.json({
      message: 'Login con Google exitoso',
      token,
      usuario,
      authMethod: idToken ? 'idToken' : 'accessToken', // Para debug
    })
  } catch (error) {
    console.error('❌ Error verificando token de Google:', error)

    // Proporcionar más detalles del error para debug
    if (error.message.includes('Access Token')) {
      return res.status(401).json({
        error: 'Access Token de Google inválido',
        details: error.message,
      })
    }

    return res.status(401).json({
      error: 'Token de Google inválido',
      details: error.message,
    })
  }
})

export default router
