const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { tipo } = req.query;
    let query = 'SELECT * FROM desparasitaciones WHERE mascota_id=?';
    const params = [req.params.mascotaId];

    if (tipo) {
      query += ' AND tipo=?';
      params.push(tipo);
    }
    query += ' ORDER BY fecha DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { tipo, fecha, producto, proxima } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO desparasitaciones (mascota_id, tipo, fecha, producto, proxima) VALUES (?,?,?,?,?)',
      [req.params.mascotaId, tipo, fecha, producto, proxima]
    );
    res.status(201).json({ id: result.insertId, message: 'Desparasitación registrada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const { tipo, fecha, producto, proxima } = req.body;
  try {
    await db.query(
      'UPDATE desparasitaciones SET tipo=?, fecha=?, producto=?, proxima=? WHERE id=?',
      [tipo, fecha, producto, proxima, req.params.id]
    );
    res.json({ message: 'Desparasitación actualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM desparasitaciones WHERE id=?', [req.params.id]);
    res.json({ message: 'Desparasitación eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
