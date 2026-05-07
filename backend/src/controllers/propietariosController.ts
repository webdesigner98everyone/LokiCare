import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../config/db';

export const getAll = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM propietarios ORDER BY nombre');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req: Request, res: Response) => {
  const { nombre, telefono, direccion, email } = req.body;
  try {
    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO propietarios (nombre, telefono, direccion, email) VALUES (?,?,?,?)',
      [nombre, telefono, direccion, email]
    );
    res.status(201).json({ id: result.insertId, message: 'Propietario creado' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
