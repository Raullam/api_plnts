// routes/cofres.js
import express from 'express'
import db from '../db.js' // afegit
import auth from '../middleware/auth.js' // Importamos el middleware correctamente

const router = express.Router()

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
 * /cofrees/{id}:
 *   get:
 *     summary: Obté els cofres d’un usuari
 *     description: Retorna tots els cofres associats a un usuari identificat pel seu ID. Requereix autenticació amb token JWT.
 *     tags:
 *       - Cofres
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l’usuari per obtenir els seus cofres.
 *     responses:
 *       200:
 *         description: Cofres trobats correctament.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cofre'
 *       401:
 *         description: No autoritzat. Cal un token vàlid.
 *       404:
 *         description: Cofre no trobat.
 *       500:
 *         description: Error intern del servidor.
 */

// Ruta GET /cofres/:userId
router.get('/:id', auth, (req, res) => {
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

/**
 * @swagger
 * /cofres/{userId}/{tipo}:
 *   post:
 *     summary: Crea un nou cofre per a un usuari
 *     description: Crea un cofre amb un tipus donat per a l'usuari identificat pel seu ID. Requereix autenticació amb token JWT.
 *     tags:
 *       - Cofres
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l’usuari per al qual es crearà el cofre.
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tipus de cofre (per exemple, 4, 8 o 12).
 *     responses:
 *       200:
 *         description: Cofre creat correctament.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cofre creat correctament
 *                 cofreId:
 *                   type: integer
 *                   example: 123
 *       401:
 *         description: No autoritzat. Cal un token vàlid.
 *       500:
 *         description: Error intern del servidor.
 */

// Ruta POST /cofres/:userId/:tipo
router.post('/:userId/:tipo', auth, (req, res) => {
  const { userId, tipo } = req.params
  const query = 'INSERT INTO cofrees (idusuari, tipo) VALUES (?, ?)'

  db.query(query, [userId, tipo], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    // Opcionalmente, puedes retornar el cofre recién creado
    res
      .status(200)
      .json({ message: 'Cofre creat correctament', cofreId: result.insertId })
  })
})

/**
 * @swagger
 * /cofres/{userId}/{cofreId}:
 *   delete:
 *     summary: Elimina un cofre d’un usuari
 *     description: Elimina un cofre específic associat a un usuari identificat pel seu ID. Requereix autenticació amb token JWT.
 *     tags:
 *       - Cofres
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l’usuari.
 *       - in: path
 *         name: cofreId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cofre a eliminar.
 *     responses:
 *       200:
 *         description: Cofre eliminat correctament.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cofre eliminat correctament
 *       401:
 *         description: No autoritzat. Cal un token vàlid.
 *       404:
 *         description: Cofre no trobat o ja eliminat.
 *       500:
 *         description: Error intern del servidor.
 */

// Ruta DELETE /cofres/:userId/:cofreId
router.delete('/:userId/:cofreId', auth, (req, res) => {
  const { userId, cofreId } = req.params
  const query = 'DELETE FROM cofrees WHERE idusuari = ? AND id = ?'

  db.query(query, [userId, cofreId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cofre no trobat o ja eliminat' })
    }
    res.status(200).json({ message: 'Cofre eliminat correctament' })
  })
})

export default router
