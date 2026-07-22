import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";
import { swaggerDocs } from "./swagger.js";

// para traer las variables establecidas en .env como PORT
dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 3001;


// Conexión permitida con el frontend
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

// Rutas
app.use("/api/auth", authRouter);
app.use("/api/amigurumis", authRouter);

// Levantamos Swagger antes de iniciar el servidor
swaggerDocs(app, PORT);

app.listen(PORT, () => {
  console.log(`SERVIDOR LEVANTADO EN EL PUERTO ${PORT}`);
});