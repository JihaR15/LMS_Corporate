const express = require('express');
const router = express.Router();
const testController = require('../controllers/test.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.post('/submit', testController.submitTest);

module.exports = router;