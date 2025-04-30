import express from 'express'
import db from '../db.js' // Asegúrate de ajustar la ruta según la ubicación de tu archivo db.js
import auth from '../middleware/auth.js' // Importamos el middleware correctamente

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Mazo
 *   description: Endpoints para gestionar el mazo de plantas de un usuario
 */

/**
 * @swagger
 * /{userId}:
 *   get:
 *     summary: Obtener el mazo de un usuario por su ID
 *     tags: [Mazo]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mazo encontrado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: No se encontraron plantas
 *       500:
 *         description: Error interno del servidor
 */

// Endpoint para obtener el mazo de un usuario por su ID
router.get('/:userId', auth, (req, res) => {
  const userId = parseInt(req.params.userId)

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'ID de usuario inválido' })
  }

  // Realizar la consulta con la conexión a la base de datos
  const query = `
    SELECT 
      p.id, 
      p.usuari_id, 
      p.nom, 
      p.tipus, 
      p.nivell, 
      p.atac, 
      p.defensa, 
      p.velocitat, 
      p.habilitat_especial, 
      p.energia, 
      p.estat, 
      p.raritat, 
      p.imatge, 
      p.ultima_actualitzacio,
      CASE 
        WHEN p.id = m.planta1_id THEN 1
        WHEN p.id = m.planta2_id THEN 2
        WHEN p.id = m.planta3_id THEN 3
        ELSE 4 
      END AS orden
    FROM mazo m
    JOIN plantas p ON p.id IN (m.planta1_id, m.planta2_id, m.planta3_id)
    WHERE m.usuari_id = ?
    ORDER BY orden;
  `

  db.query(query, [userId], (error, rows) => {
    if (error) {
      console.error('Error al consultar la base de datos:', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'No se encontraron plantas para este usuario' })
    }

    // Devolver las plantas encontradas
    res.json(rows)
  })
})

/**
 * @swagger
 * /correu/{correu}:
 *   get:
 *     summary: Obtener el mazo de un usuario por su correo electrónico
 *     tags: [Mazo]
 *     parameters:
 *       - in: path
 *         name: correu
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mazo encontrado
 *       404:
 *         description: No se encontraron plantas
 *       500:
 *         description: Error interno del servidor
 */

// Endpoint para obtener el mazo de un usuario por su correo
router.get('/correu/:correu', auth, (req, res) => {
  const correu = req.params.correu

  // Realizar la consulta con la conexión a la base de datos
  const query = `
    SELECT 
      p.id, 
      p.usuari_id, 
      p.nom, 
      p.tipus, 
      p.nivell, 
      p.atac, 
      p.defensa, 
      p.velocitat, 
      p.habilitat_especial, 
      p.energia, 
      p.estat, 
      p.raritat, 
      p.imatge, 
      p.ultima_actualitzacio,
      CASE 
        WHEN p.id = m.planta1_id THEN 1
        WHEN p.id = m.planta2_id THEN 2
        WHEN p.id = m.planta3_id THEN 3
        ELSE 4 
      END AS orden
    FROM mazo m
    JOIN plantas p ON p.id IN (m.planta1_id, m.planta2_id, m.planta3_id)
    JOIN usuaris u ON u.id = m.usuari_id
    WHERE u.correu = ?
    ORDER BY orden;
  `

  db.query(query, [correu], (error, rows) => {
    if (error) {
      console.error('Error al consultar la base de datos:', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'No se encontraron plantas para este usuario' })
    }

    // Devolver las plantas encontradas
    res.json(rows)
  })
})

/**
 * @swagger
 * /{userId}:
 *   put:
 *     summary: Actualiza o crea el mazo de un usuario
 *     tags: [Mazo]
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
 *               mazo:
 *                 type: array
 *                 maxItems: 3
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Mazo actualizado o creado correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */

// Endpoint para actualizar el mazo de un usuario
router.put('/:userId', auth, (req, res) => {
  const userId = parseInt(req.params.userId)
  const { mazo } = req.body // Puede contener entre 1 y 3 plantas

  if (isNaN(userId) || !Array.isArray(mazo) || mazo.length > 3) {
    return res
      .status(400)
      .json({ error: 'Datos inválidos. Se requieren entre 1 y 3 plantas' })
  }

  // Verificar si el usuario existe
  db.query('SELECT id FROM usuaris WHERE id = ?', [userId], (error, result) => {
    if (error) {
      console.error('❌ Error al consultar el usuario:', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'El usuario no existe' })
    }

    // Formatear los valores de las plantas, permitiendo `null`
    const [planta1, planta2, planta3] = [
      mazo[0] || null,
      mazo[1] || null,
      mazo[2] || null,
    ]

    // Verificar si el usuario ya tiene un mazo
    db.query(
      'SELECT * FROM mazo WHERE usuari_id = ?',
      [userId],
      (error, result) => {
        if (error) {
          console.error('❌ Error al verificar el mazo:', error)
          return res.status(500).json({ error: 'Error interno del servidor' })
        }

        if (result.length > 0) {
          // ✅ **Si ya tiene un mazo, lo actualizamos**
          db.query(
            `UPDATE mazo 
           SET planta1_id = ?, planta2_id = ?, planta3_id = ? 
           WHERE usuari_id = ?`,
            [planta1, planta2, planta3, userId],
            (error, updateResult) => {
              if (error) {
                console.error('❌ Error al actualizar el mazo:', error)
                return res
                  .status(500)
                  .json({ error: 'Error al actualizar el mazo' })
              }
              res.json({ message: '✅ Mazo actualizado correctamente' })
            },
          )
        } else {
          // ❌ **Si NO tiene un mazo, lo creamos**
          db.query(
            `INSERT INTO mazo (usuari_id, planta1_id, planta2_id, planta3_id) 
           VALUES (?, ?, ?, ?)`,
            [userId, planta1, planta2, planta3],
            (error, insertResult) => {
              if (error) {
                console.error('❌ Error al crear el mazo:', error)
                return res.status(500).json({ error: 'Error al crear el mazo' })
              }
              res.json({ message: '✅ Mazo creado correctamente' })
            },
          )
        }
      },
    )
  })
})
/**
 * @swagger
 * /existeMazo/{userId}:
 *   get:
 *     summary: Verifica si un usuario ya tiene un mazo creado
 *     tags: [Mazo]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resultado de la existencia del mazo
 *       400:
 *         description: ID inválido
 *       500:
 *         description: Error interno del servidor
 */

// Endpoint para verificar si un usuario tiene un mazo
router.get('/existeMazo/:userId', (req, res) => {
  const userId = parseInt(req.params.userId)

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'ID de usuario inválido' })
  }

  // Consulta para verificar si el usuario tiene un mazo
  const query = 'SELECT COUNT(*) AS count FROM mazo WHERE usuari_id = ?'

  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error('❌ Error al verificar el mazo:', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }

    const tieneMazo = results[0].count > 0
    res.json({ existe: tieneMazo }) // Devuelve { "existe": true } o { "existe": false }
  })
})

export default router
