import express from 'express'
import db from '../db.js' // Asegúrate de ajustar la ruta según la ubicación de tu archivo db.js

const router = express.Router()
/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Endpoints per a la gestió d'items
 */
/**
 * @swagger
 * /items:
 *   get:
 *     summary: Obté tots els items
 *     description: Retorna una llista de tots els items disponibles a la base de dades.
 *     tags:
 *       - Items
 *     responses:
 *       200:
 *         description: Llista d'items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nom:
 *                     type: string
 *                   descripcio:
 *                     type: string
 *                   preu:
 *                     type: number
 *                     format: float
 *       500:
 *         description: Error en obtenir els items.
 */
router.get('/', (req, res) => {
  const query = 'SELECT * FROM items'
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.json(results)
  })
})

/**
 * @swagger
 * /items/by-ids:
 *   post:
 *     summary: Obté una llista d'items segons una llista d'IDs
 *     description: Retorna els items que coincideixen amb els IDs proporcionats.
 *     tags:
 *       - Items
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Llista d'items trobats.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nom:
 *                     type: string
 *                   descripcio:
 *                     type: string
 *                   preu:
 *                     type: number
 *                     format: float
 *       400:
 *         description: L'entrada no és vàlida.
 *       500:
 *         description: Error en obtenir els items.
 */
router.post('/by-ids', (req, res) => {
  const { ids } = req.body

  if (!Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ error: "La llista d'IDs és requerida i no pot estar buida." })
  }

  const placeholders = ids.map(() => '?').join(', ')
  const query = `SELECT * FROM items WHERE id IN (${placeholders})`

  db.query(query, ids, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.json(results)
  })
})

export default router // Exportar el router
