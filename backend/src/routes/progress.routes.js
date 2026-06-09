const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.post('/complete', progressController.markMaterialAsCompleted);
router.get('/module/:module_id', progressController.checkModuleProgress);

router.get('/recent', isAdmin, progressController.getRecentActivities);

module.exports = router;