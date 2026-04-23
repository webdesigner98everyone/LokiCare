import { Router } from 'express';
import { getMascota, getResumen, updateMascota, updatePropietario, uploadFoto, upload } from '../controllers/mascotaController';

const router = Router();

router.get('/:id', getMascota);
router.get('/:id/resumen', getResumen);
router.put('/:id', updateMascota);
router.put('/:id/propietario', updatePropietario);
router.post('/:id/foto', upload.single('foto'), uploadFoto);

export default router;
