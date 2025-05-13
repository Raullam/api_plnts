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
      title:
        'API Rest Tama Plants - PROJECTE FINAL DE GRAU - CIFP PAU CASESNOVES ',
      version: '1.0.0',
      description:
        'Documentació dels diferents endpoint disponibles de Tama Plants',
    },
  },
  apis: [path.join(__dirname, 'routes/*.js')],
}

const swaggerDocs = swaggerJsdoc(swaggerOptions)

export { swaggerUi, swaggerDocs }
