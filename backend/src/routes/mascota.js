const { Router } = require('express');
const ctrl = require('../controllers/mascotaController');
const router = Router();

router.get('/:id', ctrl.getMascota);
router.get('/:id/resumen', ctrl.getResumen);
router.put('/:id', ctrl.updateMascota);
router.put('/:id/propietario', ctrl.updatePropietario);

module.exports = router;
