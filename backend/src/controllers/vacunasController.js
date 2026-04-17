const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM vacunas WHERE mascota_id=? ORDER BY fecha DESC', [req.params.mascotaId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { fecha, producto, veterinario, proxima } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO vacunas (mascota_id, fecha, producto, veterinario, proxima) VALUES (?,?,?,?,?)',
      [req.params.mascotaId, fecha, producto, veterinario, proxima]
    );
    res.status(201).json({ id: result.insertId, message: 'Vacuna registrada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const { fecha, producto, veterinario, proxima } = req.body;
  try {
    await db.query(
      'UPDATE vacunas SET fecha=?, producto=?, veterinario=?, proxima=? WHERE id=?',
      [fecha, producto, veterinario, proxima, req.params.id]
    );
    res.json({ message: 'Vacuna actualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM vacunas WHERE id=?', [req.params.id]);
    res.json({ message: 'Vacuna eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
