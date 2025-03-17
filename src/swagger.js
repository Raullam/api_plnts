import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Aplicació de Plantes',
      version: '1.0.0',
      description: "Documentació de l'API de la aplicació de plantes",
    },
  },
  apis: ['./apps.js', './routes/*.js'], // Incluimos las rutas de la carpeta routes
}

// Generamos la documentación
const swaggerDocs = swaggerJsdoc(swaggerOptions)

// Exportamos la configuración para usarla en el archivo principal
export { swaggerUi, swaggerDocs }
