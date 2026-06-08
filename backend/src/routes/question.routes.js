const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/module/:module_id', questionController.getQuestionsByModule);

router.post('/', isAdmin, questionController.createQuestionWithAnswers);
router.delete('/:id', isAdmin, questionController.deleteQuestion);

module.exports = router;