const express = require('express');
const router = express.Router();
const positionController = require('../controllers/position.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', positionController.getAllPositions);
router.get('/:id', positionController.getPositionById);

router.post('/', isAdmin, positionController.createPosition);
router.put('/:id', isAdmin, positionController.updatePosition);
router.delete('/:id', isAdmin, positionController.deletePosition);

module.exports = router;