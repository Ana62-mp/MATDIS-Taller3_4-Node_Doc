import swaggerJSDoc, { type Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { type Application } from "express";

export const swaggerDocs = (app: Application, port: number) => {

  const options: Options = {
    definition: {
      openapi: "3.0.0",

      info: {
        title: "API de Amigurumis",
        version: "1.0.0",
        description:
          "Documentación de la API REST para registrar, listar, editar y eliminar amigurumis",
      },

      servers: [
        {
          url: `http://localhost:${port}`,
          description: "Servidor local",
        },
      ],

      // Configuración del Token JWT
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },

    // Swagger busca comentarios en los archivos de rutas
    apis: ["./src/routes/*.ts"],
  };

  const swaggerSpec = swaggerJSDoc(options);

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );

  console.log(
    `Documentación disponible en http://localhost:${port}/api-docs`
  );
};