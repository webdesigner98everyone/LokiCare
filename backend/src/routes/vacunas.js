const { Router } = require('express');
const ctrl = require('../controllers/vacunasController');
const router = Router();

router.get('/mascota/:mascotaId', ctrl.getAll);
router.post('/mascota/:mascotaId', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
