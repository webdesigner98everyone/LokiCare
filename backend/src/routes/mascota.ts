import { Router } from 'express';
import { getMascota, getResumen, updateMascota, updatePropietario } from '../controllers/mascotaController';

const router = Router();

router.get('/:id', getMascota);
router.get('/:id/resumen', getResumen);
router.put('/:id', updateMascota);
router.put('/:id/propietario', updatePropietario);

export default router;
