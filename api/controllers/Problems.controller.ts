import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import prisma from "../prisma";


export const CrearProblema = async (req: Request, res: Response) => {
  const { name, priority, isCompleted } = req.body;
  const userID = (req as any).user?.UserID; // viene del JWT

  if (!userID) {
    return res.status(401).json({
      success: false,
      message: "Usuario no autenticado correctamente",
    });
  }

  if (!name || !priority) {
    return res.status(400).json({
      success: false,
      message: "Nombre y prioridad son obligatorios",
    });
  }

  try {
    // Crear la tarea con Prisma
    const task = await prisma.tasks_bambu.create({
      data: {
        UserID: userID,
        Name: name,
        Priority: priority,
        IsCompleted: isCompleted ?? false,
      },
    });

    res.status(201).json({
      success: true,
      message: "Tarea creada correctamente",
      taskId: task.TaskID,
    });
  } catch (error: any) {
    console.error("Error al crear tarea:", error.message, error.stack);

    res.status(500).json({
      success: false,
      message: "Error interno al crear la tarea",
    });
  }
};


export const ObtenerProblemas = async (req: Request, res: Response) => {
  const userID = (req as any).user?.UserID;
  if (!userID) {
    return res.status(401).json({ success: false, message: "Usuario no autenticado" });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    // Obtener tareas con paginación y ordenamiento
    const tasks = await prisma.tasks_bambu.findMany({
      where: { UserID: userID },
      orderBy: [
        { IsCompleted: 'asc' },   // primero las no completadas
        { CreatedAt: 'desc' }     // luego por fecha de creación descendente
      ],
      take: limit,
      skip,
    });

    // Contar total de tareas para paginación
    const total = await prisma.tasks_bambu.count({
      where: { UserID: userID },
    });

    res.json({
      tasks,
      page,
      limit,
      total
    });

  } catch (error) {
    console.error("Error al obtener tareas:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};


export const ActualizarProblema = async (req: Request, res: Response) => {
  const userID = (req as any).user?.UserID;
  const taskID = req.params.id;
  const { name, priority, isCompleted } = req.body;

  if (!userID) {
    return res.status(401).json({
      success: false,
      message: "Usuario no autenticado",
    });
  }

  try {
    const updated = await prisma.tasks_bambu.updateMany({
      where: {
        TaskID: Number(taskID),
        UserID: userID,
      },
      data: {
        Name: name,
        Priority: priority,
        IsCompleted: isCompleted ?? false,
        UpdatedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Tarea no encontrada o no tienes permiso para actualizarla",
      });
    }

    res.json({
      success: true,
      message: "Tarea actualizada correctamente",
    });

  } catch (error) {
    console.error("Error actualizando tarea:", error);
    res.status(500).json({
      success: false,
      message: "Error interno",
    });
  }
};


export const EliminarProblema = async (req: Request, res: Response) => {
  const userID = (req as any).user?.UserID;
  const taskID = req.params.id;

  if (!userID) {
    return res.status(401).json({
      success: false,
      message: "Usuario no autenticado",
    });
  }

  try {
    const deleted = await prisma.tasks_bambu.deleteMany({
      where: {
        TaskID: Number(taskID),
        UserID: userID,
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Tarea no encontrada o no puedes eliminarla",
      });
    }

    res.json({
      success: true,
      message: "Tarea eliminada correctamente",
    });

  } catch (error) {
    console.error("Error eliminando tarea:", error);
    res.status(500).json({
      success: false,
      message: "Error interno",
    });
  }
};


export const ObtenerProblemaPorID = async (req: Request, res: Response) => {
  const userID = (req as any).user?.UserID;
  const taskID = Number(req.params.id);

  if (!userID) {
    return res.status(401).json({ success: false, message: "Usuario no autenticado" });
  }

  try {
    const task = await prisma.tasks_bambu.findFirst({
      where: {
        TaskID: taskID,
        UserID: userID,
      },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Tarea no encontrada" });
    }

    res.json({ success: true, task });
    
  } catch (error) {
    console.error("Error obteniendo tarea:", error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
};