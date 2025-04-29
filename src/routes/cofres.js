// routes/cofres.js
import express from 'express'
import db from '../db.js' // afegit
const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Cofres
 *   description: Endpoints per a la gestió dels cofres
 */
/**
 * @swagger
 * /cofres/{id}:
 *   get:
 *     summary: Obtener cofres de un usuario por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Cofres del usuario encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: Cofre no encontrado
 *       500:
 *         description: Error del servidor
 */

// Ruta GET /cofres/:userId
router.get('/:id', (req, res) => {
  const { id } = req.params
  const query = 'SELECT * FROM cofrees WHERE idusuari = ?'
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'cofre no trobat' })
    }
    res.json(result)
  })
})

export default router
