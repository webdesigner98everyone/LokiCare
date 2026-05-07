import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../config/db';

export const getAll = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT * FROM pesos WHERE mascota_id=? ORDER BY fecha DESC', [req.params.mascotaId]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req: Request, res: Response) => {
  const { fecha, peso, notas } = req.body;
  try {
    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO pesos (mascota_id, fecha, peso, notas) VALUES (?,?,?,?)',
      [req.params.mascotaId, fecha, peso, notas]
    );
    res.status(201).json({ id: result.insertId, message: 'Peso registrado' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req: Request, res: Response) => {
  const { fecha, peso, notas } = req.body;
  try {
    await db.query(
      'UPDATE pesos SET fecha=?, peso=?, notas=? WHERE id=?',
      [fecha, peso, notas, req.params.id]
    );
    res.json({ message: 'Peso actualizado' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await db.query('DELETE FROM pesos WHERE id=?', [req.params.id]);
    res.json({ message: 'Peso eliminado' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
