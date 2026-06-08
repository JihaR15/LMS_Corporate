const express = require('express');
const router = express.Router();
const materialController = require('../controllers/material.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/module/:module_id', materialController.getMaterialsByModule);

router.post('/', isAdmin, materialController.createMaterial);
router.delete('/:id', isAdmin, materialController.deleteMaterial);

module.exports = router;