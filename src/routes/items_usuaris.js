import express from 'express'
import db from '../db.js' // Asegúrate de ajustar la ruta según la ubicación de tu archivo db.js
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import auth from '../middleware/auth.js' // Importamos el middleware correctamente

dotenv.config() // Cargar las variables de entorno

const router = express.Router()

/**
 * @swagger
 * /items_usuaris:
 *   post:
 *     summary: Realiza la compra de uno o más ítems
 *     tags: [Compra d'ítems]
 *     security:
 *       - bearerAuth: []  # Si estás usando autenticación con JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - items
 *               - totalCost
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID del usuario que realiza la compra
 *               totalCost:
 *                 type: number
 *                 description: Costo total de la compra en BTC
 *               items:
 *                 type: array
 *                 description: Lista de ítems a comprar
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemId
 *                     - cantidad
 *                     - nom
 *                   properties:
 *                     itemId:
 *                       type: integer
 *                       description: ID del ítem
 *                     cantidad:
 *                       type: integer
 *                       description: Cantidad a comprar
 *                     nom:
 *                       type: string
 *                       description: Nombre del ítem
 *     responses:
 *       200:
 *         description: Compra realizada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Error en la solicitud o saldo insuficiente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */

router.post('/', auth, async (req, res) => {
  const { userId, items, totalCost } = req.body

  console.log('Datos recibidos:', { userId, items, totalCost })

  const connection = await new Promise((resolve, reject) => {
    db.getConnection((err, connection) => {
      if (err) reject(err)
      resolve(connection)
    })
  })

  try {
    // 1️⃣ Iniciar transacción
    await new Promise((resolve, reject) => {
      connection.beginTransaction((err) => {
        if (err) reject(err)
        resolve()
      })
    })

    // 2️⃣ Obtener el usuario desde la base de datos
    const usuario = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM usuaris WHERE id = ?',
        [userId],
        (err, result) => {
          if (err) reject(err)
          resolve(result[0]) // ✅ Devuelve un objeto, no un array
        },
      )
    })

    if (!usuario) {
      throw new Error('Usuario no encontrado')
    }

    // 3️⃣ Verificar saldo
    if (usuario.btc < totalCost) {
      throw new Error('Saldo insuficiente')
    }

    // 4️⃣ Restar BTC del usuario
    await new Promise((resolve, reject) => {
      connection.query(
        'UPDATE usuaris SET btc = btc - ? WHERE id = ?',
        [totalCost, userId],
        (err, result) => {
          if (err) reject(err)
          resolve(result)
        },
      )
    })

    // 5️⃣ Para cada ítem en la compra, actualizar o insertar según corresponda
    for (const item of items) {
      const { itemId, cantidad, nom } = item
      const quantitat = cantidad // 🔁 Adaptar al nombre del campo en la base de datos

      console.log(`Procesando itemId ${itemId} con cantidad ${quantitat}`)

      // Verificar si el ítem ya existe para el usuario
      const existingItem = await new Promise((resolve, reject) => {
        connection.query(
          'SELECT * FROM items_usuaris WHERE usuari_id = ? AND item_id = ?',
          [userId, itemId],
          (err, result) => {
            if (err) reject(err)
            resolve(result[0])
          },
        )
      })

      if (existingItem) {
        // Si ya existe, actualizar la cantidad
        await new Promise((resolve, reject) => {
          connection.query(
            'UPDATE items_usuaris SET quantitat = quantitat + ? WHERE usuari_id = ? AND item_id = ?',
            [quantitat, userId, itemId],
            (err, result) => {
              if (err) reject(err)
              resolve(result)
            },
          )
        })
      } else {
        // Si no existe, insertar un nuevo registro
        await new Promise((resolve, reject) => {
          connection.query(
            'INSERT INTO items_usuaris (usuari_id, item_id, quantitat, nom) VALUES (?, ?, ?, ?)',
            [userId, itemId, quantitat, nom],
            (err, result) => {
              if (err) reject(err)
              resolve(result)
            },
          )
        })
      }
    }

    // 6️⃣ Confirmar transacción
    await new Promise((resolve, reject) => {
      connection.commit((err) => {
        if (err) reject(err)
        resolve()
      })
    })

    res.json({ success: true, message: 'Compra realizada con éxito' })
  } catch (error) {
    console.error('Error en la compraa:', error.message)

    // 7️⃣ Si ocurre un error, revertir todos los cambios
    await new Promise((resolve, reject) => {
      connection.rollback((err) => {
        if (err) reject(err)
        resolve()
      })
    })

    res.status(400).json({ success: false, error: error.message })
  } finally {
    // 8️⃣ Liberar la conexión
    connection.release()
  }
})

// // Ruta POST /items_usuaris_cofre
// router.post('/items_usuaris_cofre', auth, (req, res) => {
//   const { userId, itemId, totalCost, nom } = req.body

//   const insertQuery = `
//     INSERT INTO items_usuaris (usuari_id, item_id, quantitat, nom) VALUES (?, ?, ?, ?)
//   `

//   db.query(insertQuery, [userId, itemId, totalCost, nom], (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: err.message })
//     }

//     res.status(200).json({
//       message: 'Item asignado correctamente al usuario desde cofre',
//       itemUsuarioId: result.insertId,
//     })
//   })
// })
// Ruta POST /items_usuaris_cofre
router.post('/items_usuaris_cofre', auth, (req, res) => {
  const { userId, itemId, totalCost, nom } = req.body

  if (!userId || !itemId || !totalCost || !nom) {
    return res
      .status(400)
      .json({ error: 'Faltan campos requeridos en el cuerpo de la petición' })
  }

  const checkQuery = `
    SELECT quantitat FROM items_usuaris WHERE usuari_id = ? AND item_id = ?
  `

  db.query(checkQuery, [userId, itemId], (err, results) => {
    if (err) {
      return res.status(500).json({
        error: 'Error al consultar el item del usuario: ' + err.message,
      })
    }

    if (results.length > 0) {
      // El ítem ya existe para el usuario, actualizar cantidad
      const currentQuantity = results[0].quantitat
      const newQuantity = currentQuantity + totalCost

      const updateQuery = `
        UPDATE items_usuaris SET quantitat = ? WHERE usuari_id = ? AND item_id = ?
      `

      db.query(
        updateQuery,
        [newQuantity, userId, itemId],
        (err, updateResult) => {
          if (err) {
            return res.status(500).json({
              error: 'Error al actualizar la cantidad: ' + err.message,
            })
          }

          return res.status(200).json({
            message:
              'Cantidad actualizada correctamente para el ítem del usuario',
            updated: true,
          })
        },
      )
    } else {
      // No existe, insertar nuevo registro
      const insertQuery = `
        INSERT INTO items_usuaris (usuari_id, item_id, quantitat, nom) VALUES (?, ?, ?, ?)
      `

      db.query(insertQuery, [userId, itemId, totalCost, nom], (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ error: 'Error al insertar nuevo ítem: ' + err.message })
        }

        res.status(200).json({
          message: 'Ítem asignado correctamente al usuario desde cofre',
          itemUsuarioId: result.insertId,
          updated: false,
        })
      })
    }
  })
})

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * security:
 *   - BearerAuth: []
 *
 * /{id}:
 *   get:
 *     summary: Obtener ítems del usuario por ID
 *     description: Retorna los ítems de la tabla `items_usuaris` para el `usuari_id` especificado.
 *     tags:
 *       - Items
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario (`usuari_id`) que se desea consultar.
 *         schema:
 *           type: string
 *       - name: Authorization
 *         in: header
 *         required: true
 *         description: Token de autorización (Bearer token).
 *         schema:
 *           type: string
 *           example: 'Posa aquí el jwt_token'
 *     responses:
 *       '200':
 *         description: Ítems encontrados exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       usuari_id:
 *                         type: string
 *                         example: "abc123"
 *                       # Agrega aquí los demás campos relevantes de tu tabla items_usuaris
 *       '404':
 *         description: No se encontraron ítems para el ID proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No se encontraron ítems
 *       '500':
 *         description: Error del servidor al consultar los ítems.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Error al obtener los ítems
 */

router.get('/:id', auth, async (req, res) => {
  const { id } = req.params

  try {
    const items = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM items_usuaris WHERE usuari_id = ?',
        [id],
        (err, result) => {
          if (err) reject(err)
          resolve(result)
        },
      )
    })

    if (items.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'No se encontraron ítems' })
    }

    res.json({ success: true, items })
  } catch (error) {
    console.error('Error al obtener los ítems:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * @swagger
 * /items_usuaris/update:
 *   put:
 *     summary: Actualiza cantidades de ítems existentes para un usuario
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - usuari_id
 *                     - item_id
 *                     - quantitat
 *                   properties:
 *                     usuari_id:
 *                       type: integer
 *                     item_id:
 *                       type: integer
 *                     quantitat:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Ítems actualizados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 updatedCount:
 *                   type: integer
 *       400:
 *         description: Error de solicitud
 *       500:
 *         description: Error del servidor
 */
router.put('/update', auth, async (req, res) => {
  const { items } = req.body

  // Imprimir los ítems que llegaron en el cuerpo de la solicitud
  console.log('Ítems recibidos:', items)

  if (!Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ success: false, error: 'Lista de ítems vacía o inválida' })
  }

  const connection = await new Promise((resolve, reject) => {
    db.getConnection((err, conn) => (err ? reject(err) : resolve(conn)))
  })

  try {
    await new Promise((resolve, reject) =>
      connection.beginTransaction((err) => (err ? reject(err) : resolve())),
    )

    let updatedCount = 0

    // Iterar por los ítems y depurar cada uno
    for (const { usuari_id, item_id, quantitat } of items) {
      console.log(
        `Procesando item: usuari_id=${usuari_id}, item_id=${item_id}, quantitat=${quantitat}`,
      )

      if (quantitat > 0) {
        // Verificar si la consulta a la base de datos está funcionando
        await new Promise((resolve, reject) => {
          connection.query(
            'UPDATE items_usuaris SET quantitat = quantitat - ? WHERE usuari_id = ? AND id = ?',
            [quantitat, usuari_id, item_id],
            (err, result) => {
              if (err) {
                console.error('Error en la consulta:', err)
                return reject(err)
              }
              if (result.affectedRows > 0) {
                updatedCount++
                console.log(
                  `Se actualizó el ítem ${item_id} para el usuario ${usuari_id}`,
                )
              } else {
                console.log(
                  `No se encontró el ítem ${item_id} para el usuario ${usuari_id}`,
                )
              }
              resolve()
            },
          )
        })
      } else {
        console.log(
          `La cantidad de item ${item_id} es menor o igual a 0, no se actualizará.`,
        )
      }
    }

    await new Promise((resolve, reject) =>
      connection.commit((err) => (err ? reject(err) : resolve())),
    )

    res.status(200).json({ success: true, updatedCount })
  } catch (error) {
    console.error('Error en el proceso:', error.message)
    await new Promise((resolve) => connection.rollback(() => resolve()))
    res.status(500).json({ success: false, error: error.message })
  } finally {
    connection.release()
  }
})

export default router // Exportar el router
