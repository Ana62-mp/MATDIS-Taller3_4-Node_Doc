import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../database/prisma.js";

export interface CustomRequest extends Request {
  usuario?: any;
}

export const validarAuth = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // Tomamos el header Authorization
  const authHeader = req.headers.authorization;

  // Sacamos solo el token, quitando la palabra Bearer
  const token = authHeader && authHeader.split(" ")[1];

  // Si no vino token, no dejamos pasar
  if (!token) {
    res.status(401).json({ error: "ACCESO DENEGADO" });
    return;
  }

  try {
    // Primero revisamos si el token ya fue cerrado en logout
    const tokenRevocado = await prisma.revoked_token.findFirst({
      where: {
        token: token,
      },
    });

    // Si existe en la tabla, significa que ya no sirve
    if (tokenRevocado) {
      res.status(401).json({ error: "TOKEN INVALIDADO POR CIERRE DE SESIÓN" });
      return;
    }

    // Si no está revocado, validamos la firma y expiración del token
    const verificado = jwt.verify(
      token,
      process.env.JWT_SECRET || "secreto"
    );

    // Guardamos los datos del usuario en el request
    req.usuario = verificado;

    // Dejamos pasar al controlador
    next();

  } catch (error) {
    res.status(403).json({ error: "TOKEN INVÁLIDO O EXPIRADO" });
  }
};