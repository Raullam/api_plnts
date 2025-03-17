import express from 'express'
import db from '../db.js' // Asegúrate de ajustar la ruta según la ubicación de tu archivo db.js

const router = express.Router() // Iniciar el router

/**
 * @swagger
 * tags:
 *   name: Plantes
 *   description: Endpoints per a la gestió de plantes
 */

/**
 * @swagger
 * /plantas:
 *   get:
 *     summary: Obtenir totes les plantas
 *     tags:
 *       - Plantes
 *     responses:
 *       200:
 *         description: Llista de plantes obtengudes exitosament
 */
router.get('/', (req, res) => {
  const query = 'SELECT * FROM plantas'
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.json(results)
  })
})

/**
 * @swagger
 * /plantas/usuaris/{id}:
 *   get:
 *     summary: Obtenir totes les plantes d'un usuari específic
 *     tags:
 *       - Plantes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'usuari
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Llista de plantes de l'usuari obtenguda exitosament
 */
router.get('/usuaris/:id', (req, res) => {
  const { id } = req.params
  const query = 'SELECT * FROM plantas WHERE usuari_id = ?'
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.json(results)
  })
})

/**
 * @swagger
 * /plantas/{id}:
 *   get:
 *     summary: Obtenir una planta por ID
 *     tags:
 *       - Plantes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la planta
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Planta obtenguda exitosament
 */
router.get('/:id', (req, res) => {
  const { id } = req.params
  const query = 'SELECT * FROM plantas WHERE id = ?'
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Planta no encontrada' })
    }
    res.json(result[0])
  })
})

/**
 * @swagger
 * /plantas:
 *   post:
 *     summary: Crear una nova planta
 *     description: Endpoint per crear una nova planta a la base de dades.
 *     tags:
 *       - Plantes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuari_id:
 *                 type: integer
 *               nom:
 *                 type: string
 *               tipus:
 *                 type: string
 *               nivell:
 *                 type: integer
 *                 default: 0
 *               atac:
 *                 type: integer
 *                 default: 0
 *               defensa:
 *                 type: integer
 *                 default: 0
 *               velocitat:
 *                 type: integer
 *                 default: 0
 *               habilitat_especial:
 *                 type: string
 *               energia:
 *                 type: integer
 *                 default: 100
 *               estat:
 *                 type: string
 *                 default: "actiu"
 *               raritat:
 *                 type: string
 *                 default: "comú"
 *               imatge:
 *                 type: string
 *     responses:
 *       201:
 *         description: Planta creada correctament.
 *       500:
 *         description: Error en la creació de la planta.
 */
router.post('/', (req, res) => {
  const {
    usuari_id,
    nom,
    tipus,
    nivell,
    atac,
    defensa,
    velocitat,
    habilitat_especial,
    energia,
    estat,
    raritat,
    imatge,
  } = req.body

  const query = `
    INSERT INTO plantas 
    (usuari_id, nom, tipus, nivell, atac, defensa, velocitat, habilitat_especial, energia, estat, raritat, imatge) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

  db.query(
    query,
    [
      usuari_id,
      nom,
      tipus,
      nivell || 0,
      atac || 0,
      defensa || 0,
      velocitat || 0,
      habilitat_especial,
      energia || 100,
      estat || 'actiu',
      raritat || 'comú',
      imatge,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      res.status(201).json({
        id: result.insertId,
        usuari_id,
        nom,
        tipus,
        nivell: nivell || 1,
        atac: atac || 10,
        defensa: defensa || 10,
        velocitat: velocitat || 5,
        habilitat_especial,
        energia: energia || 100,
        estat: estat || 'actiu',
        raritat: raritat || 'comú',
        imatge,
      })
    },
  )
})

/**
 * @swagger
 * /plantas/{id}:
 *   put:
 *     summary: Actualitzar una planta
 *     description: Modifica les dades d'una planta existent.
 *     tags:
 *       - Plantes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la planta a actualitzar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               tipus:
 *                 type: string
 *               nivell:
 *                 type: integer
 *               atac:
 *                 type: integer
 *               defensa:
 *                 type: integer
 *               velocitat:
 *                 type: integer
 *               habilitat_especial:
 *                 type: string
 *               energia:
 *                 type: integer
 *               estat:
 *                 type: string
 *               raritat:
 *                 type: string
 *               imatge:
 *                 type: string
 *     responses:
 *       200:
 *         description: Planta actualitzada correctament.
 *       500:
 *         description: Error en l'actualització de la planta.
 */
router.put('/:id', (req, res) => {
  const { id } = req.params
  const {
    nom,
    tipus,
    nivell,
    atac,
    defensa,
    velocitat,
    habilitat_especial,
    energia,
    estat,
    raritat,
    imatge,
  } = req.body

  const query = `
    UPDATE plantas 
    SET 
      nom = ?, 
      tipus = ?, 
      nivell = ?, 
      atac = ?, 
      defensa = ?, 
      velocitat = ?, 
      habilitat_especial = ?, 
      energia = ?, 
      estat = ?, 
      raritat = ?, 
      imatge = ?, 
      ultima_actualitzacio = CURRENT_TIMESTAMP 
    WHERE id = ?`

  db.query(
    query,
    [
      nom,
      tipus,
      nivell,
      atac,
      defensa,
      velocitat,
      habilitat_especial,
      energia,
      estat,
      raritat,
      imatge,
      id,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      res.json({ message: 'Planta actualitzada correctament' })
    },
  )
})

/**
 * @swagger
 * /plantas/{id}:
 *   delete:
 *     summary: Elimina una planta
 *     description: Esborra una planta de la base de dades.
 *     tags:
 *       - Plantes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la planta a eliminar.
 *     responses:
 *       200:
 *         description: Planta eliminada correctament.
 *       500:
 *         description: Error en l'eliminació de la planta.
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params
  const query = 'DELETE FROM plantas WHERE id = ?'
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.json({ message: 'Planta eliminada correctament' })
  })
})

export default router // Exportar el router
