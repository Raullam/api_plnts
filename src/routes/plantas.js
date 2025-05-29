import express from 'express'
import db from '../db.js' // Asegúrate de ajustar la ruta según la ubicación de tu archivo db.js
import auth from '../middleware/auth.js' // Importamos el middleware correctamente

const router = express.Router() // Iniciar el router

/**
 * @swagger
 * tags:
 *   name: Plantes
 *   description: Endpoints per a la gestió de plantes
 */

/**
 * @swagger
 * /plantes:
 *   get:
 *     summary: Obtenir totes les plantes
 *     tags:
 *       - Plantes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Llista de plantes obtinguda exitosament
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   usuari_id: { type: integer }
 *                   nom: { type: string }
 *                   tipus: { type: string }
 *                   nivell: { type: integer }
 *                   atac: { type: integer }
 *                   defensa: { type: integer }
 *                   velocitat: { type: integer }
 *                   habilitat_especial: { type: string }
 *                   energia: { type: integer }
 *                   estat: { type: string }
 *                   raritat: { type: string }
 *                   imatge: { type: string }
 *                   ultima_actualitzacio: { type: string, format: date-time }
 *       500:
 *         description: Error al servidor
 */

router.get('/', auth, (req, res) => {
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
 * /plantes/{id}:
 *   get:
 *     summary: Obtenir una planta per ID
 *     tags:
 *       - Plantes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la planta
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Planta obtinguda exitosament
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 usuari_id: { type: integer }
 *                 nom: { type: string }
 *                 tipus: { type: string }
 *                 nivell: { type: integer }
 *                 atac: { type: integer }
 *                 defensa: { type: integer }
 *                 velocitat: { type: integer }
 *                 habilitat_especial: { type: string }
 *                 energia: { type: integer }
 *                 estat: { type: string }
 *                 raritat: { type: string }
 *                 imatge: { type: string }
 *                 ultima_actualitzacio: { type: string, format: date-time }
 *       404:
 *         description: Planta no trobada
 *       500:
 *         description: Error al servidor
 */

router.get('/:id', auth, (req, res) => {
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
 * /plantes/usuaris/{id}:
 *   get:
 *     summary: Obtenir totes les plantes d'un usuari específic
 *     tags:
 *       - Plantes
 *     security:
 *       - bearerAuth: []
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
 *       500:
 *         description: Error en obtenir les plantes de l'usuari
 */

router.get('/usuaris/:id', auth, (req, res) => {
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
 * /plantes:
 *   post:
 *     summary: Crear una nova planta
 *     description: Endpoint per crear una nova planta a la base de dades.
 *     tags:
 *       - Plantes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuari_id
 *               - nom
 *               - tipus
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
 *                 default: 10
 *               defensa:
 *                 type: integer
 *                 default: 10
 *               velocitat:
 *                 type: integer
 *                 default: 5
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 usuari_id:
 *                   type: integer
 *                 nom:
 *                   type: string
 *                 tipus:
 *                   type: string
 *                 nivell:
 *                   type: integer
 *                 atac:
 *                   type: integer
 *                 defensa:
 *                   type: integer
 *                 velocitat:
 *                   type: integer
 *                 habilitat_especial:
 *                   type: string
 *                 energia:
 *                   type: integer
 *                 estat:
 *                   type: string
 *                 raritat:
 *                   type: string
 *                 imatge:
 *                   type: string
 *       500:
 *         description: Error en la creació de la planta.
 */

router.post('/', auth, (req, res) => {
  const {
    usuari_id,
    nom,
    tipus,
    nivell = 0, // Se establece el valor predeterminado aquí
    atac = 10,
    defensa = 10,
    velocitat = 5,
    habilitat_especial,
    energia = 100,
    estat = 'actiu',
    raritat = 'comú',
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
      nivell, // Ya tiene valor por defecto
      atac,
      defensa,
      velocitat,
      habilitat_especial,
      energia,
      estat,
      raritat,
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
        nivell, // Mismo valor que se insertó
        atac,
        defensa,
        velocitat,
        habilitat_especial,
        energia,
        estat,
        raritat,
        imatge,
      })
    },
  )
})

/**
 * @swagger
 * /plantes/{id}:
 *   put:
 *     summary: Actualitzar una planta
 *     description: Modifica les dades d'una planta existent.
 *     tags:
 *       - Plantes
 *     security:
 *       - bearerAuth: []
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

router.put('/:id', auth, (req, res) => {
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
 * /plantes/{id}:
 *   delete:
 *     summary: Elimina una planta
 *     description: Esborra una planta de la base de dades.
 *     tags:
 *       - Plantes
 *     security:
 *       - bearerAuth: []
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

router.delete('/:id', auth, (req, res) => {
  const { id } = req.params
  const query = 'DELETE FROM plantas WHERE id = ?'
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.json({ message: 'Planta eliminada correctament' })
  })
})

router.patch('/subirEstadisticasPlanta/:id', auth, (req, res) => {
  const { id } = req.params
  const { velocitat, defensa, atac } = req.body

  console.log('ID de la planta:', id)
  console.log('Datos recibidos:', { velocitat, defensa, atac })

  const velocitatValue = velocitat !== undefined ? velocitat : 0
  const defensaValue = defensa !== undefined ? defensa : 0
  const atacValue = atac !== undefined ? atac : 0

  const query =
    'UPDATE plantas SET velocitat = ?, defensa = ?, atac = ? WHERE id = ?'
  const values = [velocitatValue, defensaValue, atacValue, id]

  console.log('Consulta SQL generada:', query)
  console.log('Valores para la consulta:', values)

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error en la consulta:', err.message)
      return res.status(500).json({ error: err.message })
    }

    if (result.affectedRows === 0) {
      console.log('Error: No se encontró la planta con ID:', id)
      return res.status(404).json({ error: 'Planta no trobada' })
    }

    res.json({
      message: 'Estadístiques de la planta actualitzades correctament',
    })
  })
})

export default router // Exportar el router
