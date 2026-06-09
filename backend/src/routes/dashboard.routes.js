const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.use(verifyToken, isAdmin);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/popular', dashboardController.getPopularModules);

module.exports = router;