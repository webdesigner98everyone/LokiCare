import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

import mascotaRoutes from './routes/mascota';
import vacunasRoutes from './routes/vacunas';
import desparasitacionesRoutes from './routes/desparasitaciones';
import banosRoutes from './routes/banos';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/mascota', mascotaRoutes);
app.use('/api/vacunas', vacunasRoutes);
app.use('/api/desparasitaciones', desparasitacionesRoutes);
app.use('/api/banos', banosRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🐶 LokiCare API corriendo en http://localhost:${PORT}`);
});
