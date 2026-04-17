import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../config/db';

export const getAll = async (req: Request, res: Response) => {
  try {
    const { tipo } = req.query;
    let query = 'SELECT * FROM desparasitaciones WHERE mascota_id=?';
    const params: (string | number)[] = [req.params.mascotaId];

    if (tipo) {
      query += ' AND tipo=?';
      params.push(tipo as string);
    }
    query += ' ORDER BY fecha DESC';

    const [rows] = await db.query<RowDataPacket[]>(query, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req: Request, res: Response) => {
  const { tipo, fecha, producto, proxima } = req.body;
  try {
    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO desparasitaciones (mascota_id, tipo, fecha, producto, proxima) VALUES (?,?,?,?,?)',
      [req.params.mascotaId, tipo, fecha, producto, proxima]
    );
    res.status(201).json({ id: result.insertId, message: 'Desparasitación registrada' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req: Request, res: Response) => {
  const { tipo, fecha, producto, proxima } = req.body;
  try {
    await db.query(
      'UPDATE desparasitaciones SET tipo=?, fecha=?, producto=?, proxima=? WHERE id=?',
      [tipo, fecha, producto, proxima, req.params.id]
    );
    res.json({ message: 'Desparasitación actualizada' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await db.query('DELETE FROM desparasitaciones WHERE id=?', [req.params.id]);
    res.json({ message: 'Desparasitación eliminada' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
