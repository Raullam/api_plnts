import express from 'express'
import db from '../db.js' // Asegúrate de ajustar la ruta según la ubicación de tu archivo db.js

const router = express.Router()

// Ruta para agregar un usuario a la lista de espera
router.post('/agregar', (req, res) => {
  const {
    nom,
    correu,
    contrasenya,
    edat,
    nacionalitat,
    codiPostal,
    imatgePerfil,
    btc,
    admin,
    superadmin,
    LE,
    nivell,
  } = req.body

  const query = `
    INSERT INTO matchmaking_usuaris (nom, correu, contrasenya, edat, nacionalitat, codiPostal, imatgePerfil, btc, admin, superadmin, LE, nivell, creado_en)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`

  db.query(
    query,
    [
      nom,
      correu,
      contrasenya,
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
    (error, result) => {
      if (error) {
        return res.status(500).json({
          message: 'Error al agregar usuario a la lista de espera',
          error,
        })
      }
      res.status(200).json({
        message: 'Usuario agregado a la lista de espera',
        userId: result.insertId,
      })
    },
  )
})

// Ruta para obtener los usuarios que están en espera
router.get('/lista', (req, res) => {
  const query = 'SELECT * FROM matchmaking_usuaris'

  db.query(query, (error, results) => {
    if (error) {
      return res
        .status(500)
        .json({ message: 'Error al obtener la lista de espera', error })
    }
    res.status(200).json(results)
  })
})

// Ruta para eliminar un usuario de la lista de espera
router.delete('/eliminar/:id', (req, res) => {
  const { id } = req.params
  const query = 'DELETE FROM matchmaking_usuaris WHERE id = ?'

  db.query(query, [id], (error, result) => {
    if (error) {
      return res.status(500).json({
        message: 'Error al eliminar usuario de la lista de espera',
        error,
      })
    }
    res.status(200).json({ message: 'Usuario eliminado de la lista de espera' })
  })
})

// Ruta para eliminar por correu de la lista de espera
router.delete('/eliminar-correu/:correu', (req, res) => {
  const { correu } = req.params
  const query = 'DELETE FROM matchmaking_usuaris WHERE correu = ?'

  db.query(query, [correu], (error, result) => {
    if (error) {
      return res.status(500).json({
        message: 'Error al eliminar usuario de la lista de espera',
        error,
      })
    }
    res.status(200).json({ message: 'Usuario eliminado de la lista de espera' })
  })
})

// Ruta para crear una partida entre dos usuarios
router.post('/crear-partida', (req, res) => {
  const { usuari1, usuari2 } = req.body

  const query =
    'INSERT INTO partidas (usuari1_id, usuari2_id, estado) VALUES (?, ?, "en curs")'

  db.query(query, [usuari1.id, usuari2.id], (error, result) => {
    if (error) {
      return res
        .status(500)
        .json({ message: 'Error al crear la partida', error })
    }
    res
      .status(200)
      .json({ message: 'Partida creada', partidaId: result.insertId })
  })
})

export default router // Exportar el router
