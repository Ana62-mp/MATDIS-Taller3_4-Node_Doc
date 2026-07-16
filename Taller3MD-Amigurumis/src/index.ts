import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;

//Conexion con front-end
app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());

app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log("SERVIDOR LEVANTADO EN EL PUERTO", PORT);
});