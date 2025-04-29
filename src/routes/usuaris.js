import express from 'express' // Solo importa express
import db from '../db.js' // Asegúrate de ajustar la ruta según la ubicación de tu archivo db.js
import bcrypt from 'bcryptjs' // Usamos bcryptjs en lugar de bcrypt normal
import jwt from 'jsonwebtoken'
import auth from '../middleware/auth.js' // Importamos el middleware correctamente

import dotenv from 'dotenv'
dotenv.config()

const router = express.Router() // Aquí creas el router correctamente
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /usuaris:
 *   get:
 *     summary: Obté tots els usuaris
 *     description: Retorna tots els usuaris. Només accessible per usuaris autenticats.
 *     tags:
 *       - Usuaris
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Llista d'usuaris.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuari'
 *       401:
 *         description: No autoritzat.
 *       500:
 *         description: Error del servidor.
 */
router.get('/', auth, (req, res) => {
  const query = 'SELECT * FROM usuaris'
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.json(results)
  })
})

/**
 * @swagger
 * /usuaris/{id}:
 *   get:
 *     summary: Obté un usuari per ID
 *     description: Retorna les dades d'un usuari específic pel seu ID.
 *     tags:
 *       - Usuaris
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'usuari a obtenir.
 *     responses:
 *       200:
 *         description: Usuari obtingut correctament.
 *       404:
 *         description: Usuari no trobat.
 *       500:
 *         description: Error en obtenir l'usuari.
 */
router.get('/:id', (req, res) => {
  const { id } = req.params
  const query = 'SELECT * FROM usuaris WHERE id = ?'
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Usuari no trobat' })
    }
    res.json(result[0])
  })
})

/**
 * @swagger
 * /usuaris:
 *   post:
 *     summary: Crea un nou usuari
 *     description: Afegeix un nou usuari a la base de dades.
 *     tags:
 *       - Usuaris
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               correu:
 *                 type: string
 *               contrasenya:
 *                 type: string
 *               edat:
 *                 type: integer
 *               nacionalitat:
 *                 type: string
 *               codiPostal:
 *                 type: string
 *               imatgePerfil:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuari creat correctament.
 *       400:
 *         description: Error en la validació.
 *       500:
 *         description: Error en crear l'usuari.
 */
router.post('/', async (req, res) => {
  try {
    const {
      nom,
      correu,
      contrasenya,
      edat,
      nacionalitat,
      codiPostal,
      imatgePerfil,
      btc = 0.0, // Valor por defecto según la BD
      admin = false,
      superadmin = false,
      LE = 0,
      nivell = 1,
    } = req.body

    // Validación básica
    if (!nom || !correu || !contrasenya) {
      return res
        .status(400)
        .json({ error: 'Nom, correu i contrasenya són obligatoris' })
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contrasenya, 10)

    // Insertar usuario en la BD
    const query = `
      INSERT INTO usuaris 
      (nom, correu, contrasenya, edat, nacionalitat, codiPostal, imatgePerfil, btc, admin, superadmin, LE, nivell) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    db.query(
      query,
      [
        nom,
        correu,
        hashedPassword,
        edat,
        nacionalitat,
        codiPostal,
        imatgePerfil,
        btc,
        admin,
        superadmin,
        LE,
        nivell,
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message })
        }

        // Generar token JWT
        const token = jwt.sign(
          { userId: result.insertId },
          process.env.JWT_SECRET,
          { expiresIn: '1h' },
        )

        res.status(201).json({
          id: result.insertId,
          nom,
          correu,
          edat,
          nacionalitat,
          codiPostal,
          imatgePerfil,
          btc,
          admin,
          superadmin,
          LE,
          nivell,
          token, // Devuelve el token para autenticación
        })
      },
    )
  } catch (error) {
    console.error('Error en el servidor:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /usuaris/{id}:
 *   put:
 *     summary: Actualitza un usuari
 *     description: Modifica la informació d'un usuari existent. Ruta protegida es necessita un token JWT a la capçalera `Authorization`.
 *     tags:
 *       - Usuaris
 *     security:
 *       - bearerAuth: []  # 🔐 Protecció amb JWT
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'usuari a actualitzar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               correu:
 *                 type: string
 *               contrasenya:
 *                 type: string
 *               edat:
 *                 type: integer
 *               nacionalitat:
 *                 type: string
 *               codiPostal:
 *                 type: string
 *               imatgePerfil:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuari actualitzat correctament.
 *       403:
 *         description: No tens permís per modificar aquest usuari. (Accés denegat)
 *       401:
 *         description: Token invàlid o no proporcionat.
 *       404:
 *         description: Usuari no trobat.
 *       500:
 *         description: Error intern del servidor en actualitzar l'usuari.
 */

router.put('/:id', auth, async (req, res) => {
  const { id } = req.params
  const { nom, edat, nacionalitat, codiPostal } = req.body

  console.log(`📩 Datos recibidos para actualizar el usuario ${id}:`, req.body)
  console.log('🧾 Usuario autenticado:', req.user)

  // Verificar permisos
  if (req.user.id !== parseInt(id) && req.user.role !== 'ADMIN') {
    return res
      .status(403)
      .json({ error: 'No tienes permiso para modificar este usuario' })
  }

  // Validación básica
  if (!nom || !edat || !nacionalitat || !codiPostal) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' })
  }
  // ⛑️ Validación de tipos
  if (
    typeof nom !== 'string' ||
    typeof edat !== 'number' ||
    typeof nacionalitat !== 'string' ||
    typeof codiPostal !== 'string'
  ) {
    return res
      .status(400)
      .json({ error: 'Datos inválidos en el cuerpo de la petición' })
  }
  try {
    const query = `
      UPDATE usuaris 
      SET nom = ?, edat = ?, nacionalitat = ?, codiPostal = ?
      WHERE id = ?
    `
    const params = [nom, edat, nacionalitat, codiPostal, id]

    db.query(query, params, (err, result) => {
      if (err) {
        console.error('🚨 Error en la consulta SQL:', err.message)
        return res.status(500).json({ error: 'Error interno del servidor' })
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' })
      }

      console.log('✅ Usuario actualizado correctamente en la base de datos')

      // Obtener el usuario actualizado
      db.query('SELECT * FROM usuaris WHERE id = ?', [id], (err, results) => {
        if (err) {
          console.error(
            '🚨 Error al recuperar usuario actualizado:',
            err.message,
          )
          return res
            .status(500)
            .json({ error: 'Error al recuperar usuario actualizado' })
        }

        if (results.length === 0) {
          return res.status(404).json({ error: 'Usuario no encontrado' })
        }

        const user = results[0]
        console.log('🔄 Usuario actualizado con éxito:', user)

        res.json({
          message: 'Usuario actualizado correctamente',
          usuario: user,
        })
      })
    })
  } catch (error) {
    console.error('🚨 Error en el servidor:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

/**
 * @swagger
 * /usuaris/{id}:
 *   delete:
 *     summary: Elimina un usuari
 *     description: Elimina un usuari de la base de dades per l'ID proporcionat. Només l'usuari mateix o un administrador pot fer aquesta acció.
 *     tags:
 *       - Usuaris
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'usuari a eliminar.
 *     responses:
 *       200:
 *         description: Usuari eliminat correctament.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuari eliminat correctament
 *       403:
 *         description: No tens permís per eliminar aquest usuari.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No tienes permiso para eliminar este usuario
 *       404:
 *         description: Usuari no trobat.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Usuario no encontrado
 *       500:
 *         description: Error en eliminar l'usuari.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error intern del servidor
 */

router.delete('/:id', auth, (req, res) => {
  const { id } = req.params

  // Validación de permisos (opcional, recomendado)
  if (req.user.id !== parseInt(id) && req.user.role !== 'ADMIN') {
    return res
      .status(403)
      .json({ error: 'No tienes permiso para eliminar este usuario' })
  }

  const query = 'DELETE FROM usuaris WHERE id = ?'
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.json({ message: 'Usuari eliminat correctament' })
  })
})

/**
 * @swagger
 * /usuaris/correu/{correu}:
 *   get:
 *     summary: Cerca un usuari per correu
 *     description: Retorna un usuari basat en l'adreça de correu proporcionada.
 *     tags:
 *       - Usuaris
 *     parameters:
 *       - in: path
 *         name: correu
 *         required: true
 *         schema:
 *           type: string
 *         description: Correu de l'usuari a buscar.
 *     responses:
 *       200:
 *         description: Usuari trobat.
 *       404:
 *         description: Usuari no trobat.
 *       500:
 *         description: Error en la cerca de l'usuari.
 */
router.get('/correu/:correu', (req, res) => {
  const { correu } = req.params
  const query = 'SELECT * FROM usuaris WHERE correu = ?'
  db.query(query, [correu], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Usuari no trobat' })
    }
    res.json(result[0])
  })
})

// 🔹 Endpoint de Login (Verifica la contraseña con bcrypt)
router.post('/api/login', async (req, res) => {
  const { email, password } = req.body

  console.log('📥 Petición recibida en /api/login')
  console.log(`📧 Email recibido: ${email}`)
  console.log(`🔑 Password recibido: ${password}`)

  // Verificar si email o password están vacíos
  if (!email || !password) {
    console.log('⚠️ Error: Faltan datos en la petición.')
    return res.status(400).json({ error: 'Faltan datos' })
  }

  // Buscar usuario en la base de datos
  const query = 'SELECT * FROM usuaris WHERE correu = ?'
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('❌ Error en la base de datos:', err)
      return res.status(500).json({ error: 'Error en la base de datos' })
    }

    console.log(`🛠 Resultado de la consulta: ${JSON.stringify(results)}`)

    if (results.length === 0) {
      console.log('🚫 Usuario no encontrado.')
      return res.status(400).json({ error: 'Usuario no encontrado' })
    }

    const usuario = results[0]
    console.log(`🔍 Usuario encontrado: ${JSON.stringify(usuario)}`)

    try {
      // Comparar la contraseña ingresada con la almacenada en la BD
      const passwordCorrecta = await bcrypt.compare(
        password,
        usuario.contrasenya,
      )

      console.log(`🔍 Comparación de contraseña: ${passwordCorrecta}`)

      if (passwordCorrecta) {
        console.log('✅ Login exitoso.')
        return res.json({ message: 'Login exitoso', usuario })
      } else {
        console.log('🚫 Contraseña incorrecta.')
        return res.status(400).json({ error: 'Contraseña incorrecta' })
      }
    } catch (bcryptError) {
      console.error('❌ Error en bcrypt.compare:', bcryptError)
      return res.status(500).json({ error: 'Error al verificar contraseña' })
    }
  })
})

/**
 * @swagger
 * /usuaris/btc/{userId}:
 *   put:
 *     summary: Actualitza el saldo de BTC d'un usuari
 *     description: Permet actualitzar el saldo de BTC d'un usuari específic.
 *     tags:
 *       - Usuaris
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Saldo actualitzat amb èxit.
 *       400:
 *         description: Error en actualitzar el saldo.
 *       500:
 *         description: Error intern del servidor.
 */
router.put('/btc/:userId', async (req, res) => {
  const { userId } = req.params
  const { amount } = req.body
  try {
    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE usuaris SET btc = btc + ? WHERE id = ?',
        [amount, userId],
        (err, result) => {
          if (err) reject(err)
          resolve(result)
        },
      )
    })
    res.json({ success: true, message: 'Saldo actualizado con éxito' })
  } catch (error) {
    console.error('Error al actualizar saldo:', error.message)
    res.status(400).json({ success: false, error: error.message })
  }
})

//////////////////////////////////////////////////////////////////

router.get('/mazo/plantas/:usuarioId', (req, res) => {
  const { usuarioId } = req.params

  const query = `
    SELECT planta1_id, planta2_id, planta3_id 
    FROM mazo
    WHERE usuari_id = ?`

  db.query(query, [usuarioId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message })

    if (result.length === 0) {
      return res.status(404).json({ error: 'Mazo no encontrado' })
    }

    const { planta1_id, planta2_id, planta3_id } = result[0]

    if (!planta1_id && !planta2_id && !planta3_id) {
      return res.status(404).json({ error: 'No hay plantas en el mazo' })
    }

    const plantasQuery = `
      SELECT id, nom, nivell, imatge 
      FROM plantas 
      WHERE id IN (?, ?, ?)`

    db.query(
      plantasQuery,
      [planta1_id, planta2_id, planta3_id],
      (err, plantas) => {
        if (err) return res.status(500).json({ error: err.message })

        res.json({
          message: 'Plantas del mazo obtenidas',
          plantas,
        })
      },
    )
  })
})

// Obtener o crear un mazo con UNA planta
router.get('/mazo/:usuarioId/:plantaId', (req, res) => {
  const { usuarioId, plantaId } = req.params

  const deckQuery = 'SELECT * FROM mazo WHERE usuari_id = ?'
  db.query(deckQuery, [usuarioId], (err, deckResult) => {
    if (err) return res.status(500).json({ error: err.message })

    if (deckResult.length === 0) {
      // Si no tiene mazo, crearlo con UNA planta
      const createDeckQuery =
        'INSERT INTO mazo (usuari_id, nombre, descripcion, fecha_creacion, planta1_id) VALUES (?, "Mazo Inicial", "Mazo creado automáticamente", NOW(), ?)'
      db.query(createDeckQuery, [usuarioId, plantaId], (err, insertResult) => {
        if (err) return res.status(500).json({ error: err.message })

        return res.json({
          message: 'Mazo creado con una planta',
          mazoId: insertResult.insertId,
        })
      })
    } else {
      // Si ya tiene un mazo, simplemente devolverlo
      res.json({ message: 'Mazo encontrado', mazo: deckResult[0] })
    }
  })
})

// Añadir una segunda o tercera planta al mazo
router.put('/mazo/:usuarioId', (req, res) => {
  const { usuarioId } = req.params
  const { plantaId } = req.body

  if (!plantaId) {
    return res.status(400).json({ error: 'ID de planta requerido' })
  }

  // Verificar qué espacio está disponible en el mazo
  const checkDeckQuery = 'SELECT * FROM mazo WHERE usuari_id = ?'
  db.query(checkDeckQuery, [usuarioId], (err, deckResult) => {
    if (err) return res.status(500).json({ error: err.message })

    if (deckResult.length === 0) {
      return res.status(404).json({ error: 'Mazo no encontrado' })
    }

    let updateQuery = ''
    const mazo = deckResult[0]

    if (!mazo.planta2_id) {
      updateQuery = 'UPDATE mazo SET planta2_id = ? WHERE usuari_id = ?'
    } else if (!mazo.planta3_id) {
      updateQuery = 'UPDATE mazo SET planta3_id = ? WHERE usuari_id = ?'
    } else {
      return res.status(400).json({ error: 'El mazo ya tiene 3 plantas' })
    }

    db.query(updateQuery, [plantaId, usuarioId], (err) => {
      if (err) return res.status(500).json({ error: err.message })

      res.json({ message: 'Planta añadida al mazo', mazoId: mazo.id })
    })
  })
})

export default router // Exportar el router
