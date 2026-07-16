import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

//S le da a la interface Request algo adicional, en este caso user opcional
export interface CustomRequest extends Request {
  usuario?: any;
}

//En cada ruta que se use, valida que esta activo sesión
export const validarAuth = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Acceso denegado" });
    return;
  }

  try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET || "secreto");

    req.usuario = verificado;

    next();

  } catch (error) {
    res.status(403).json({ error: "Token inválido o expirado" });
  }
};