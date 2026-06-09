const express = require('express');
const router = express.Router();
const operatorController = require('../controllers/operator.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/dashboard-data', verifyToken, operatorController.getOperatorDashboardData);

module.exports = router;