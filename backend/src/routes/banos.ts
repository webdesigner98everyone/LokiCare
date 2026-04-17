import { Router } from 'express';
import { getAll, create, update, remove } from '../controllers/banosController';

const router = Router();

router.get('/mascota/:mascotaId', getAll);
router.post('/mascota/:mascotaId', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
