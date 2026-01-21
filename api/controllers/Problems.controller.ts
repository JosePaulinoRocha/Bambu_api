import { Request, Response } from 'express';
import { connect } from '../BD/Accesos_BD';
import { RowDataPacket } from 'mysql2/promise';

export const CrearProblema = async (req: Request, res: Response) => {

  const { name, priority, isCompleted } = req.body;
  const userID = (req as any).user?.UserID; // viene del JWT

  if (!userID) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado correctamente'
    });
  }

  if (!name || !priority) {
    return res.status(400).json({
      success: false,
      message: 'Nombre y prioridad son obligatorios'
    });
  }

  try {
    const con = await connect();

    const result: any = await con.query(
      `
        INSERT INTO tasks_bambu
          (UserID, Name, Priority, IsCompleted)
        VALUES
          (?, ?, ?, ?)
      `,
      [
        userID,
        name,
        priority,             
        isCompleted ?? false   
      ]
    );

    await con.end();

    res.status(201).json({
      success: true,
      message: 'Tarea creada correctamente',
      taskId: result[0].insertId
    });

  } catch (error: any) {
    console.error('Error al crear tarea:', error.message, error.stack);

    res.status(500).json({
      success: false,
      message: 'Error interno al crear la tarea'
    });
  }
};

export const ObtenerProblemas = async (req: Request, res: Response) => {
  const userID = (req as any).user?.UserID;
  if (!userID) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  let connection;
  try {
    connection = await connect();

    const query = `
      SELECT TaskID, Name, Priority, IsCompleted, CreatedAt, UpdatedAt
      FROM tasks_bambu
      WHERE UserID = ?
      ORDER BY
        IsCompleted ASC, -- Primero no resueltas (0), luego resueltas (1)
        FIELD(Priority, 'high', 'medium', 'low') ASC,
        CreatedAt DESC
      LIMIT ? OFFSET ?
    `;
    const params = [userID, limit, offset];

    const [rows] = await connection.query(query, params);

    // Obtener total para paginación
    const [totalRows] = await connection.query(
      'SELECT COUNT(*) as total FROM tasks_bambu WHERE UserID = ?',
      [userID]
    );
    const total = (totalRows as any)[0]?.total ?? 0;

    return res.json({
      tasks: rows,
      page,
      limit,
      total
    });

  } catch (error) {
    console.error('Error al obtener tareas:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  } finally {
    await connection?.end();
  }
};


export const ActualizarProblema = async (req: Request, res: Response) => {
  const userID = (req as any).user?.UserID;
  const taskID = req.params.id;
  const { name, priority, isCompleted } = req.body;

  if (!userID) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  let connection;
  try {
    connection = await connect();

    const query = `
      UPDATE tasks_bambu
      SET
        Name = ?,
        Priority = ?,
        IsCompleted = ?,
        UpdatedAt = NOW()
      WHERE TaskID = ? AND UserID = ?
    `;

    const [result] = await connection.query(query, [
      name,
      priority,
      isCompleted ? 1 : 0,
      taskID,
      userID
    ]);

    return res.json({
      success: true,
      message: 'Tarea actualizada correctamente'
    });

  } catch (error) {
    console.error('Error actualizando tarea:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno'
    });
  } finally {
    await connection?.end();
  }
};


export const EliminarProblema = async (req: Request, res: Response) => {
  const userID = (req as any).user?.UserID;
  const taskID = req.params.id;

  if (!userID) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  let connection;
  try {
    connection = await connect();

    const query = `
      DELETE FROM tasks_bambu
      WHERE TaskID = ? AND UserID = ?
    `;

    const [result] = await connection.query(query, [taskID, userID]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada o no puedes eliminarla'
      });
    }

    return res.json({
      success: true,
      message: 'Tarea eliminada correctamente'
    });

  } catch (error) {
    console.error('Error eliminando tarea:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno'
    });
  } finally {
    await connection?.end();
  }
};

export const ObtenerProblemaPorID = async (req: Request, res: Response) => {
  const userID = (req as any).user?.UserID;
  const taskID = req.params.id;

  if (!userID) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }

  let connection;
  try {
    connection = await connect();
    const query = 'SELECT * FROM tasks_bambu WHERE TaskID = ? AND UserID = ?';

    const [rows] = await connection.query<RowDataPacket[]>(query, [taskID, userID]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    }

    return res.json({ success: true, task: rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error interno' });
  } finally {
    await connection?.end();
  }
};
