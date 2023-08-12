import swaggerJsDoc from 'swagger-jsdoc';

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.1',
    info: {
      title: 'API Docs for E-Commerce App',
      description: 'API Documentation for E-Commerce App'
    }
  },
  apis: ['./docs/**/*.yaml']
};
export default swaggerJsDoc(swaggerOptions);
