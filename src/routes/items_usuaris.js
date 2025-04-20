import express from 'express'
import db from '../db.js' // Asegúrate de ajustar la ruta según la ubicación de tu archivo db.js
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config() // Cargar las variables de entorno

const router = express.Router()

/**
 * @swagger
 * /items_usuaris:
 *   post:
 *     summary: Realitza una compra d'ítems per un usuari
 *     description: Permet a un usuari comprar ítems restando el cost en BTC i actualitzant la seva quantitat de ítems.
 *     tags:
 *       - Items
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID de l'usuari que realitza la compra.
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: integer
 *                       description: ID de l'ítem que es vol comprar.
 *                     quantitat:
 *                       type: integer
 *                       description: Quantitat de l'ítem a comprar.
 *               totalCost:
 *                 type: number
 *                 format: float
 *                 description: Cost total de la compra en BTC.
 *     responses:
 *       200:
 *         description: Compra realitzada amb èxit.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Compra realitzada amb èxit.
 *       400:
 *         description: Error en la compra, per exemple, saldo insuficient o usuari no trobat.
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
 *                   example: Saldo insuficient.
 *       500:
 *         description: Error intern del servidor.
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
 *                   example: Error al realitzar la compra.
 */
router.post('/', async (req, res) => {
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
          'SELECT * FROM iusuari WHERE usuari_id = ? AND item_id = ?',
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
            'UPDATE iusuari SET quantitat = quantitat + ? WHERE usuari_id = ? AND item_id = ?',
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
            'INSERT INTO iusuari (usuari_id, item_id, quantitat, nom) VALUES (?, ?, ?, ?)',
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

// ver por id
router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const items = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM iusuari WHERE usuari_id = ?',
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

export default router // Exportar el router
