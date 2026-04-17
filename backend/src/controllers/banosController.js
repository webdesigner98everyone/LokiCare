const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM banos WHERE mascota_id=? ORDER BY fecha DESC', [req.params.mascotaId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { fecha, hora, observaciones } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO banos (mascota_id, fecha, hora, observaciones) VALUES (?,?,?,?)',
      [req.params.mascotaId, fecha, hora, observaciones]
    );
    res.status(201).json({ id: result.insertId, message: 'Baño registrado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const { fecha, hora, observaciones } = req.body;
  try {
    await db.query(
      'UPDATE banos SET fecha=?, hora=?, observaciones=? WHERE id=?',
      [fecha, hora, observaciones, req.params.id]
    );
    res.json({ message: 'Baño actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM banos WHERE id=?', [req.params.id]);
    res.json({ message: 'Baño eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
