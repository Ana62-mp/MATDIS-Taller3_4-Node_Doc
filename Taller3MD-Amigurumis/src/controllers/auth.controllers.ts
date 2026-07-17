import { type Request, type Response } from "express";
import { type CustomRequest } from "../middlewares/auth.middleware.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../database/prisma.js";

//REGISTRAR
export const registrarUsuario = async (req: Request, res: Response) => {
  const username = req.body.username?.trim();
  const password = req.body.password;
  const rol = req.body.rol;

  try {
    const usuarioExiste = await prisma.usuarios.findFirst({
      where: {
        username: username,
      },
    });

    if (usuarioExiste) {
      res.status(400).json({ error: "El usuario ya existe. Intente otro username" });
      return;
    }

    if (!rol) {
      res.status(400).json({ error: "Debe seleccionar un rol" });
      return;
    }

    if (rol !== "USER" && rol !== "ADMIN") {
      res.status(400).json({ error: "Rol inválido. Solo se permite USER o ADMIN" });
      return;
    }

    const passwordEncriptado = await bcrypt.hash(password, 10);

    const nuevoUsuario = await prisma.usuarios.create({
      data: {
        username: username,
        password: passwordEncriptado,
        rol: rol,
      },
    });

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: nuevoUsuario.username,
      rol: nuevoUsuario.rol,
    });

  } catch (error) {
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

//LOGIN
export const login = async (req: Request, res: Response) => {
  const username = req.body.username?.trim();
  const password = req.body.password;

  console.log("BODY LOGIN:", req.body);
  console.log("USERNAME:", username);
  console.log("PASSWORd:", password);

  try {
    const usuario = await prisma.usuarios.findFirst({
      where: {
        username: username,
      },
    });

    console.log("USUARIO ENCONTRADO:", usuario);

    if (!usuario) {
      res.status(401).json({ error: "Usuario o contraseña incorrectos" });
      return;
    }

    const passwordCorrecto = await bcrypt.compare(password, usuario.password);

    console.log("PASSWORD CORRECTO:", passwordCorrecto);

    if (!passwordCorrecto) {
      res.status(401).json({ error: "Usuario o contraseña incorrectos" });
      return;
    }

    const token = jwt.sign(
      {
        id: Number(usuario.id),
        username: usuario.username,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET || "secreto",
      {
        expiresIn: "2h",
      }
    );

    res.status(200).json({
      mensaje: "Login correcto",
      token: token,
    });

  } catch (error) {
    console.log("ERROR loginm:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

// Perfil después sde login
export const perfil = async (req: CustomRequest, res: Response) => {
  res.status(200).json({
    Mensaje: "Bienvenido al sistema protegido por jwt",
    Usuario: req.usuario?.username,
    Rol: req.usuario?.rol,
    Estatus: "Autenticado exitosamente",
  });
};

//LOGOUT
export const logout = async (req: Request, res: Response) => {
  // Tomamos el header Authorization
  const authHeader = req.headers.authorization;

  // Sacamos solo el token, quitando la palabra Bearer
  const token = authHeader && authHeader.split(" ")[1];

  // Si no llegó token, no se puede cerrar sesión
  if (!token) {
    res.status(401).json({ error: "NO EXISTE TOKEN PARA CERRAR" });
    return;
  }

  try {
    // Decodificamos el token para obtener su fecha de expiración
    const decoded = jwt.decode(token) as jwt.JwtPayload | null;

    // Si el token no se puede leer, respondemos error
    if (!decoded || !decoded.exp) {
      res.status(400).json({ error: "TOKEN NO VÁLIDO" });
      return;
    }

    // Convertimos la expiración del token a fecha normal
    const expiresAt = new Date(decoded.exp * 1000);

    // Guardamos el token en la tabla blacklist de tokens 
    await prisma.revoked_token.create({
      data: {
        token: token,
        expires_at: expiresAt,
      },
    });

    res.status(200).json({
      mensaje: "Sesión cerrada exitosamente",
    });

  } catch (error: any) {
    // Si el token ya estaba guardado, igual respondemos como cerrado
    if (error.code === "P2002") {
      res.status(200).json({
        mensaje: "Sesión ya estaba cerrada",
      });
      return;
    }

    console.log("ERROR LOGOUT:", error);
    res.status(500).json({ error: "ERROR AL CERRAR SESIÓN" });
  }
};