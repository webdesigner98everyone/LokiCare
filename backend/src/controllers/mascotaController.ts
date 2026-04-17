import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../config/db';

export const getMascota = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT m.*, p.nombre AS propietario_nombre, p.telefono, p.direccion, p.email
       FROM mascotas m JOIN propietarios p ON m.propietario_id = p.id
       WHERE m.id = ?`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Mascota no encontrada' });
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMascota = async (req: Request, res: Response) => {
  const { nombre, especie, raza, sexo, color, fecha_nacimiento, microchip } = req.body;
  try {
    await db.query(
      `UPDATE mascotas SET nombre=?, especie=?, raza=?, sexo=?, color=?, fecha_nacimiento=?, microchip=? WHERE id=?`,
      [nombre, especie, raza, sexo, color, fecha_nacimiento, microchip, req.params.id]
    );
    res.json({ message: 'Mascota actualizada' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePropietario = async (req: Request, res: Response) => {
  const { nombre, telefono, direccion, email } = req.body;
  try {
    const [mascota] = await db.query<RowDataPacket[]>(
      'SELECT propietario_id FROM mascotas WHERE id=?', [req.params.id]
    );
    if (!mascota.length) return res.status(404).json({ error: 'Mascota no encontrada' });

    await db.query(
      'UPDATE propietarios SET nombre=?, telefono=?, direccion=?, email=? WHERE id=?',
      [nombre, telefono, direccion, email, mascota[0].propietario_id]
    );
    res.json({ message: 'Propietario actualizado' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getResumen = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const [mascota] = await db.query<RowDataPacket[]>(
      `SELECT m.*, p.nombre AS propietario_nombre, p.telefono
       FROM mascotas m JOIN propietarios p ON m.propietario_id = p.id WHERE m.id=?`, [id]
    );
    if (!mascota.length) return res.status(404).json({ error: 'Mascota no encontrada' });

    const [ultimaVacuna] = await db.query<RowDataPacket[]>(
      'SELECT * FROM vacunas WHERE mascota_id=? ORDER BY fecha DESC LIMIT 1', [id]
    );
    const [ultimaDesInt] = await db.query<RowDataPacket[]>(
      'SELECT * FROM desparasitaciones WHERE mascota_id=? AND tipo="interna" ORDER BY fecha DESC LIMIT 1', [id]
    );
    const [ultimaDesExt] = await db.query<RowDataPacket[]>(
      'SELECT * FROM desparasitaciones WHERE mascota_id=? AND tipo="externa" ORDER BY fecha DESC LIMIT 1', [id]
    );
    const [ultimoBano] = await db.query<RowDataPacket[]>(
      'SELECT * FROM banos WHERE mascota_id=? ORDER BY fecha DESC LIMIT 1', [id]
    );

    res.json({
      mascota: mascota[0],
      ultimaVacuna: ultimaVacuna[0] || null,
      ultimaDesparasitacionInterna: ultimaDesInt[0] || null,
      ultimaDesparasitacionExterna: ultimaDesExt[0] || null,
      ultimoBano: ultimoBano[0] || null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
