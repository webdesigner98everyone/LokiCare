import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../config/db';

export const getAll = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT * FROM banos WHERE mascota_id=? ORDER BY fecha DESC', [req.params.mascotaId]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req: Request, res: Response) => {
  const { fecha, hora, observaciones } = req.body;
  try {
    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO banos (mascota_id, fecha, hora, observaciones) VALUES (?,?,?,?)',
      [req.params.mascotaId, fecha, hora, observaciones]
    );
    res.status(201).json({ id: result.insertId, message: 'Baño registrado' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req: Request, res: Response) => {
  const { fecha, hora, observaciones } = req.body;
  try {
    await db.query(
      'UPDATE banos SET fecha=?, hora=?, observaciones=? WHERE id=?',
      [fecha, hora, observaciones, req.params.id]
    );
    res.json({ message: 'Baño actualizado' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await db.query('DELETE FROM banos WHERE id=?', [req.params.id]);
    res.json({ message: 'Baño eliminado' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
