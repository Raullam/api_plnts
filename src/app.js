import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { PORT } from './config.js'

// Importar rutas modularizadas
import usuarisRoutes from './routes/usuaris.js'
import plantasRoutes from './routes/plantas.js'
import itemsRoutes from './routes/items.js'
import loginRoutes from './routes/login.js'
import itemsUsuarisRoutes from './routes/items_usuaris.js'
import mazoRoutes from './routes/mazo.js'
import matchmakingRoutes from './routes/matchmaking.js'
import { swaggerUi, swaggerDocs } from './swagger.js'
import db from './db.js' // Asegúrate de ajustar la ruta según la ubicación de tu archivo db.js

dotenv.config()

const app = express()
app.use(cors())
app.use(bodyParser.json())

// Configurar Swagger para documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// Definir rutas utilizando archivos separados
app.use('/usuaris', usuarisRoutes)
app.use('/plantas', plantasRoutes)
app.use('/items', itemsRoutes)
app.use('/api', loginRoutes)
app.use('/items_usuaris', itemsUsuarisRoutes)
app.use('/mazo', mazoRoutes)
app.use('/matchmaking', matchmakingRoutes)

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Welcome to server Game Plants')
})

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`)
  console.log(
    `Documentación disponible en https://apiplnts-production.up.railway.app/api-docs/`,
  )
})
