import { Router } from "express";
import multer from "multer";
import {login, registrarUsuario, perfil, logout,} from "../controllers/auth.controllers.js";
import {listarAmigurumis, registrarAmigurumi, obtenerFotoAmigurumi, eliminarAmigurumi, editarAmigurumi,} from "../controllers/amigurumi.controllers.js";
import { obtenerFotoVehiculo, obtenerVehiculos, registrarVehiculo } from "../controllers/vehiculo.controllers.js";
import { validarAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Guarda temporalmente la img
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

// Rutas públicas
router.post("/login", login);
router.post("/registrar", registrarUsuario);

// Rutas protegidas
router.get("/perfil", validarAuth, perfil);
router.post("/logout", validarAuth, logout);

// Rutas protegidas de amigurumis
router.get("/amigurumis", validarAuth, listarAmigurumis);
router.get("/amigurumis/:id/foto", validarAuth, obtenerFotoAmigurumi);
router.post("/amigurumis/registrar", validarAuth, upload.single("file"), registrarAmigurumi);
router.put("/amigurumis/:id", validarAuth, upload.single("file"), editarAmigurumi);
router.delete("/amigurumis/:id", validarAuth, eliminarAmigurumi);

// Rutas protegidas de vehiculos
router.get("/vehiculos", validarAuth, obtenerVehiculos)
router.get("/vehiculos/:id/foto", validarAuth, obtenerFotoVehiculo)
router.post("/vehiculos/registrar", validarAuth, upload.single("file"), registrarVehiculo);

export default router;