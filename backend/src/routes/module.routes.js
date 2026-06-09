const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/module.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.post('/', isAdmin, moduleController.createModule);
router.get('/', moduleController.getAllModules);
router.put('/:id', isAdmin, moduleController.updateModule);
router.delete('/:id', isAdmin, moduleController.deleteModule);

module.exports = router;