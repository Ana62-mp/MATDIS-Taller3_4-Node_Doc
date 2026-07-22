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

/**
 * @swagger
 * /api/auth/amigurumis:
 *   get:
 *     summary: Obtiene la lista de amigurumis
 *     tags:
 *       - Amigurumis
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de amigurumis obtenida correctamente
 *       401:
 *         description: Token no enviado o no válido
 *       500:
 *         description: Error al listar los amigurumis
 */
router.get("/amigurumis", validarAuth, listarAmigurumis);

router.get("/amigurumis/:id/foto", validarAuth, obtenerFotoAmigurumi);

/**
 * @swagger
 * /api/auth/amigurumis/registrar:
 *   post:
 *     summary: Registra un nuevo amigurumi
 *     tags:
 *       - Amigurumis
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - tipo
 *               - descripcion
 *               - tiempoElaboracion
 *               - nivelDificultad
 *               - file
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Oso tejido
 *               tipo:
 *                 type: string
 *                 example: Animal
 *               descripcion:
 *                 type: string
 *                 example: Oso amigurumi elaborado a crochet
 *               tiempoElaboracion:
 *                 type: string
 *                 example: 5 horas
 *               nivelDificultad:
 *                 type: string
 *                 example: Intermedio
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Amigurumi registrado correctamente
 *       400:
 *         description: Datos incorrectos o foto no seleccionada
 *       401:
 *         description: Token no enviado o no válido
 *       500:
 *         description: Error al registrar el amigurumi
 */
router.post("/amigurumis/registrar", validarAuth, upload.single("file"), registrarAmigurumi);

/**
 * @swagger
 * /api/auth/amigurumis/{id}:
 *   put:
 *     summary: Actualiza un amigurumi existente
 *     tags:
 *       - Amigurumis
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del amigurumi que se desea actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Conejo tejido
 *               tipo:
 *                 type: string
 *                 example: Animal
 *               descripcion:
 *                 type: string
 *                 example: Conejo amigurumi actualizado
 *               tiempoElaboracion:
 *                 type: string
 *                 example: 6 horas
 *               nivelDificultad:
 *                 type: string
 *                 example: Avanzado
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Amigurumi actualizado correctamente
 *       401:
 *         description: Token no enviado o no válido
 *       404:
 *         description: Amigurumi no encontrado
 *       500:
 *         description: Error al actualizar el amigurumi
 */
router.put("/amigurumis/:id", validarAuth, upload.single("file"), editarAmigurumi);

/**
 * @swagger
 * /api/auth/amigurumis/{id}:
 *   delete:
 *     summary: Elimina un amigurumi por su ID
 *     tags:
 *       - Amigurumis
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del amigurumi que se desea eliminar
 *     responses:
 *       200:
 *         description: Amigurumi eliminado correctamente
 *       401:
 *         description: Token no enviado o no válido
 *       404:
 *         description: Amigurumi no encontrado
 *       500:
 *         description: Error al eliminar el amigurumi
 */
router.delete("/amigurumis/:id", validarAuth, eliminarAmigurumi);

// Rutas protegidas de vehiculos
router.get("/vehiculos", validarAuth, obtenerVehiculos)
router.get("/vehiculos/:id/foto", validarAuth, obtenerFotoVehiculo)
router.post("/vehiculos/registrar", validarAuth, upload.single("file"), registrarVehiculo);

export default router;