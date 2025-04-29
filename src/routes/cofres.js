// routes/cofres.js
import express from 'express'
import db from '../db.js' // afegit
import { auth } from 'google-auth-library'
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

export default router
