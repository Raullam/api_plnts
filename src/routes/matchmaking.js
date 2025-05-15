import express from 'express'
import db from '../db.js' // Asegúrate de ajustar la ruta según la ubicación de tu archivo db.js
import auth from '../middleware/auth.js' // Importamos el middleware correctamente

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Matchmaking
 *   description: Endpoints relacionados con el sistema de emparejamiento y partidas
 */
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /agregar:
 *   post:
 *     summary: Agrega un usuario a la lista de espera
 *     tags: [Matchmaking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom: { type: string }
 *               correu: { type: string }
 *               contrasenya: { type: string }
 *               edat: { type: integer }
 *               nacionalitat: { type: string }
 *               codiPostal: { type: string }
 *               imatgePerfil: { type: string }
 *               btc: { type: number }
 *               admin: { type: boolean }
 *               superadmin: { type: boolean }
 *               LE: { type: number }
 *               nivell: { type: integer }
 *             required: [nom, correu, contrasenya]
 *     responses:
 *       200:
 *         description: Usuario agregado correctamente
 *       500:
 *         description: Error en el servidor
 */

// Ruta para agregar un usuario a la lista de espera
// router.post('/agregar', auth, (req, res) => {
//   const {
//     nom,
//     correu,
//     contrasenya,
//     edat,
//     nacionalitat,
//     codiPostal,
//     imatgePerfil,
//     btc,
//     admin,
//     superadmin,
//     LE,
//     nivell,
//   } = req.body

//   const query = `
//     INSERT INTO matchmaking_usuaris (nom, correu, contrasenya, edat, nacionalitat, codiPostal, imatgePerfil, btc, admin, superadmin, LE, nivell, creado_en)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`

//   db.query(
//     query,
//     [
//       nom,
//       correu,
//       contrasenya,
//       edat,
//       nacionalitat,
//       codiPostal,
//       imatgePerfil,
//       btc,
//       admin,
//       superadmin,
//       LE,
//       nivell,
//     ],
//     (error, result) => {
//       if (error) {
//         return res.status(500).json({
//           message: 'Error al agregar usuario a la lista de espera',
//           error,
//         })
//       }
//       res.status(200).json({
//         message: 'Usuario agregado a la lista de espera',
//         userId: result.insertId,
//       })
//     },
//   )
// })

router.post('/afegir_usuari_a_la_llista_matchmaking', auth, (req, res) => {
  const { correu, nacionalitat, codiPostal, nivell } = req.body

  const query = `
    INSERT INTO matchmaking_usuaris (correu, nacionalitat, codiPostal, nivell)
    VALUES (?, ?, ?, ?)`

  db.query(
    query,
    [correu, nacionalitat, codiPostal, nivell],
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

/**
 * @swagger
 * /usuaris_a_la_llista_de_matchmaking:
 *   get:
 *     summary: Obtener todos los usuarios en la lista de espera
 *     tags: [Matchmaking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   nom: { type: string }
 *                   correu: { type: string }
 *                   contrasenya: { type: string }
 *                   edat: { type: integer }
 *                   nacionalitat: { type: string }
 *                   codiPostal: { type: string }
 *                   imatgePerfil: { type: string }
 *                   btc: { type: number }
 *                   admin: { type: boolean }
 *                   superadmin: { type: boolean }
 *                   LE: { type: number }
 *                   nivell: { type: integer }
 *                   creado_en: { type: string, format: date-time }
 *       500:
 *         description: Error en el servidor
 */

// Ruta para obtener los usuarios que están en espera
// router.get('/usuaris_a_la_llista_de_matchmaking', auth, (req, res) => {
//   const query = 'SELECT * FROM matchmaking_usuaris'

//   db.query(query, (error, results) => {
//     if (error) {
//       return res
//         .status(500)
//         .json({ message: 'Error al obtener la lista de espera', error })
//     }
//     res.status(200).json(results)
//   })
// })

// Ruta para obtener los usuarios que están en espera
router.get('/usuaris_a_la_llista_de_matchmaking2', auth, (req, res) => {
  const query = 'SELECT * FROM matchmaking_usuaris2'

  db.query(query, (error, results) => {
    if (error) {
      return res
        .status(500)
        .json({ message: 'Error al obtener la lista de espera', error })
    }
    res.status(200).json(results)
  })
})
/**
 * @swagger
 * /eliminar_usuari_de_la_llista_matchmaking/{id}:
 *   delete:
 *     summary: Elimina un usuario de la lista de espera por ID
 *     tags: [Matchmaking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       500:
 *         description: Error en el servidor
 */

// Ruta para eliminar un usuario de la lista de espera
// router.delete(
//   '/eliminar_usuari_de_la_llista_matchmaking/:id',
//   auth,
//   (req, res) => {
//     const { id } = req.params
//     const query = 'DELETE FROM matchmaking_usuaris WHERE id = ?'

//     db.query(query, [id], (error, result) => {
//       if (error) {
//         return res.status(500).json({
//           message: 'Error al eliminar usuario de la lista de espera',
//           error,
//         })
//       }
//       res
//         .status(200)
//         .json({ message: 'Usuario eliminado de la lista de espera' })
//     })
//   },
// )
router.delete(
  '/eliminar_usuari_de_la_llista_matchmaking2/:id',
  auth,
  (req, res) => {
    const { id } = req.params
    const query = 'DELETE FROM matchmaking_usuaris2 WHERE id = ?'

    db.query(query, [id], (error, result) => {
      if (error) {
        return res.status(500).json({
          message: 'Error al eliminar usuario de la lista de espera',
          error,
        })
      }
      res
        .status(200)
        .json({ message: 'Usuario eliminado de la lista de espera' })
    })
  },
)
/**
 * @swagger
 * /eliminar-correu/{correu}:
 *   delete:
 *     summary: Elimina un usuario de la lista de espera por correo electrónico
 *     tags: [Matchmaking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: correu
 *         required: true
 *         description: Correo electrónico del usuario a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario eliminado de la lista de espera
 *       401:
 *         description: No autorizado - Token no válido o ausente
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al eliminar usuario de la lista de espera
 *                 error:
 *                   type: object
 */

// Ruta para eliminar por correu de la lista de espera
// router.delete('/eliminar-correu/:correu', auth, (req, res) => {
//   const { correu } = req.params
//   const query = 'DELETE FROM matchmaking_usuaris WHERE correu = ?'

//   db.query(query, [correu], (error, result) => {
//     if (error) {
//       return res.status(500).json({
//         message: 'Error al eliminar usuario de la lista de espera',
//         error,
//       })
//     }
//     res.status(200).json({ message: 'Usuario eliminado de la lista de espera' })
//   })
// })
router.delete(
  '/eliminar-usuari-llista-matchmaking/:correu',
  auth,
  (req, res) => {
    const { correu } = req.params
    const query = 'DELETE FROM matchmaking_usuaris2 WHERE correu = ?'

    db.query(query, [correu], (error, result) => {
      if (error) {
        return res.status(500).json({
          message: 'Error al eliminar usuario de la lista de espera',
          error,
        })
      }
      res
        .status(200)
        .json({ message: 'Usuario eliminado de la lista de espera' })
    })
  },
)

// NO LO USAMOS POR AHORA
// /**
//  * @swagger
//  * /crear-partida:
//  *   post:
//  *     summary: Crea una partida entre dos usuarios
//  *     tags: [Matchmaking]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               usuari1:
//  *                 type: object
//  *                 properties:
//  *                   id: { type: integer }
//  *               usuari2:
//  *                 type: object
//  *                 properties:
//  *                   id: { type: integer }
//  *     responses:
//  *       200:
//  *         description: Partida creada correctamente
//  *       500:
//  *         description: Error al crear la partida
//  */

// // Ruta para crear una partida entre dos usuarios
// router.post('/crear-partida', (req, res) => {
//   const { usuari1, usuari2 } = req.body

//   const query =
//     'INSERT INTO partidas (usuari1_id, usuari2_id, estado) VALUES (?, ?, "en curs")'

//   db.query(query, [usuari1.id, usuari2.id], (error, result) => {
//     if (error) {
//       return res
//         .status(500)
//         .json({ message: 'Error al crear la partida', error })
//     }
//     res
//       .status(200)
//       .json({ message: 'Partida creada', partidaId: result.insertId })
//   })
// })

export default router // Exportar el router
