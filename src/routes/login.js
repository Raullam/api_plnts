const express = require('express')
const router = express.Router()
const db = require('../config/db') // Asegúrate de ajustar la ruta según la ubicación de tu archivo db.js
const bcrypt = require('bcryptjs') // Usa bcryptjs para comparar la contraseña
const jwt = require('jsonwebtoken') // Importamos jwt
require('dotenv').config()

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Inicia sessió i genera un token JWT.
 *     description: Verifica les credencials de l'usuari i retorna un token JWT si són correctes.
 *     tags:
 *       - Autenticació
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuari@example.com
 *               password:
 *                 type: string
 *                 example: contrasenya123
 *     responses:
 *       200:
 *         description: Login exitoso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login exitoso
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: usuari@example.com
 *       400:
 *         description: Credenciales incorrectas o faltan parámetros.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Usuario no encontrado
 *       500:
 *         description: Error del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error en la base de datos
 */

// 🔹 Endpoint de Login (Verifica la contraseña con bcrypt y genera un token)
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  // Validación de parámetros
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
      // Verificación de la contraseña
      const passwordCorrecta = await bcrypt.compare(
        password,
        usuario.contrasenya,
      )

      if (!passwordCorrecta) {
        return res.status(400).json({ error: 'Contraseña incorrecta' })
      }

      // Generación del token JWT
      const token = jwt.sign(
        { userId: usuario.id, email: usuario.correu }, // Información que incluirás en el token
        process.env.JWT_SECRET, // Clave secreta (debe estar en el archivo .env)
        { expiresIn: '1h' }, // El token expira en 1 hora
      )
      // 🛠️ Imprimir el token en la consola para verificarlo
      console.log('TOKEN GENERADO:', token)

      return res.json({ message: 'Login exitoso', token: token, usuario })
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
      } // else {
      //   // Si el usuario no existe, crearlo en la base de datos
      //   const insertQuery =
      //     'INSERT INTO usuaris (nom, correu, contrasenya, imatgePerfil) VALUES (?, ?, ?, ?)';
      //   db.query(insertQuery, [name, email, '', picture], (err, result) => {
      //     if (err) {
      //       console.error('Error al crear usuario:', err);
      //       return res.status(500).json({ error: 'Error al registrar usuario' });
      //     }
      //     usuario = { id: result.insertId, nom: name, correu: email, imatgePerfil: picture };
      //   });
      // }

      // Generar un token JWT propio
      const token = jwt.sign(
        { userId: usuario.id, email: usuario.correu },
        process.env.JWT_SECRET,
        {
          expiresIn: '1h',
        },
      )

      res.json({ message: 'Login con Google exitoso', token, usuario })
    })
  } catch (error) {
    console.error('Error verificando el ID Token de Google:', error)
    return res.status(401).json({ error: 'Token de Google inválido' })
  }
})

// module.exports = router

export default router
