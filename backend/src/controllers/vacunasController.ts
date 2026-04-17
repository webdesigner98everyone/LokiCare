import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../config/db';

export const getAll = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT * FROM vacunas WHERE mascota_id=? ORDER BY fecha DESC', [req.params.mascotaId]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req: Request, res: Response) => {
  const { fecha, producto, veterinario, proxima } = req.body;
  try {
    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO vacunas (mascota_id, fecha, producto, veterinario, proxima) VALUES (?,?,?,?,?)',
      [req.params.mascotaId, fecha, producto, veterinario, proxima]
    );
    res.status(201).json({ id: result.insertId, message: 'Vacuna registrada' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req: Request, res: Response) => {
  const { fecha, producto, veterinario, proxima } = req.body;
  try {
    await db.query(
      'UPDATE vacunas SET fecha=?, producto=?, veterinario=?, proxima=? WHERE id=?',
      [fecha, producto, veterinario, proxima, req.params.id]
    );
    res.json({ message: 'Vacuna actualizada' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await db.query('DELETE FROM vacunas WHERE id=?', [req.params.id]);
    res.json({ message: 'Vacuna eliminada' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
