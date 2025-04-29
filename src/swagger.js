// swagger.js
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import path from 'path'
import { fileURLToPath } from 'url'

// Definir __dirname manualmente
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Aplicació de Plantes',
      version: '1.0.0',
      description: "Documentació de l'API de la aplicació de plantes",
    },
  },
  apis: [path.join(__dirname, 'routes/*.js')],
}

const swaggerDocs = swaggerJsdoc(swaggerOptions)

export { swaggerUi, swaggerDocs }
