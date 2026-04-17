const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/mascota', require('./routes/mascota'));
app.use('/api/vacunas', require('./routes/vacunas'));
app.use('/api/desparasitaciones', require('./routes/desparasitaciones'));
app.use('/api/banos', require('./routes/banos'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🐶 LokiCare API corriendo en http://localhost:${PORT}`);
});
