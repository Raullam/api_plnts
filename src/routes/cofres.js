// routes/cofres.js
import express from 'express'
const router = express.Router()

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
    res.json(result[0])
  })
})

export default router
