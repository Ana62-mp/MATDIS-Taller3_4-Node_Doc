import { type Request, type Response } from "express";
import prisma from "../database/prisma.js";

export const listarAmigurumis = async (req: Request, res: Response) => {
  try {
    const amigurumis = await prisma.amigurumis.findMany({
      select: {
        id: true,
        nombre: true,
        tipo: true,
        descripcion: true,
        tiempo_elaboracion: true,
        nivel_dificultad: true,
        mime_type: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    const respuesta = amigurumis.map((a: any) => ({
      id: a.id,
      nombre: a.nombre,
      tipo: a.tipo,
      descripcion: a.descripcion,
      tiempoElaboracion: a.tiempo_elaboracion,
      nivelDificultad: a.nivel_dificultad,
      mimeType: a.mime_type,
      foto: null,
    }));

    res.status(200).json(respuesta);

  } catch (error) {
    res.status(500).json({ error: "Error al listar amigurumis" });
  }
};

export const registrarAmigurumi = async (req: Request, res: Response) => {
  const {
    nombre,
    tipo,
    descripcion,
    tiempoElaboracion,
    nivelDificultad,
  } = req.body;

  const archivo = req.file;

  if (!archivo) {
    res.status(400).json({ error: "Debe seleccionar una foto" });
    return;
  }

  try {
    const nuevoAmigurumi = await prisma.amigurumis.create({
      data: {
        nombre,
        tipo,
        descripcion,
        tiempo_elaboracion: tiempoElaboracion,
        nivel_dificultad: nivelDificultad,
        mime_type: archivo.mimetype,
        foto: new Uint8Array(archivo.buffer),
      },
    });

    res.status(201).json({
      mensaje: "Amigurumi registrado correctamente",
      amigurumi: nuevoAmigurumi,
    });

  } catch (error) {
    res.status(500).json({ error: "Error al registrar el amigurumi" });
  }
};

export const obtenerFotoAmigurumi = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const amigurumi = await prisma.amigurumis.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!amigurumi) {
      res.status(404).json({ error: "Amigurumi no encontrado" });
      return;
    }

    if (!amigurumi.foto) {
      res.status(404).json({ error: "Foto no encontrada" });
      return;
    }

    res.setHeader("Content-Type", amigurumi.mime_type || "image/jpeg");
    res.send(amigurumi.foto);

  } catch (error) {
    res.status(500).json({ error: "Error al obtener la foto del amigurumi" });
  }
};

export const eliminarAmigurumi = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const amigurumi = await prisma.amigurumis.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!amigurumi) {
      res.status(404).json({ error: "Amigurumi no encontrado" });
      return;
    }

    await prisma.amigurumis.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({
      mensaje: "Amigurumi eliminado correctamente",
    });

  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el amigurumi" });
  }
};

export const editarAmigurumi = async (req: Request, res: Response) => {
  const { id } = req.params;

  const {
    nombre,
    tipo,
    descripcion,
    tiempoElaboracion,
    nivelDificultad,
  } = req.body;

  const archivo = req.file;

  try {
    const amigurumiActual = await prisma.amigurumis.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!amigurumiActual) {
      res.status(404).json({ error: "Amigurumi no encontrado" });
      return;
    }

    const amigurumiActualizado = await prisma.amigurumis.update({
      where: {
        id: Number(id),
      },
      data: {
        nombre,
        tipo,
        descripcion,
        tiempo_elaboracion: tiempoElaboracion,
        nivel_dificultad: nivelDificultad,

        mime_type: archivo ? archivo.mimetype : amigurumiActual.mime_type,
        foto: archivo ? new Uint8Array(archivo.buffer) : amigurumiActual.foto,
      },
    });

    res.status(200).json({
      mensaje: "Amigurumi actualizado correctamente",
      amigurumi: amigurumiActualizado,
    });

  } catch (error) {
    res.status(500).json({ error: "Error al editar el amigurumi" });
  }
};