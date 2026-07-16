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
  res.status(200).json({
    Mensaje: "Sesión cerrada exitosamente",
  });
};