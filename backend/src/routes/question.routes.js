const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const questionController = require('../controllers/question.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

const uploadDir = path.join(__dirname, '../../uploads/temp');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, 'import-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.use(verifyToken);

router.get('/module/:module_id', questionController.getQuestionsByModule);

router.post('/', isAdmin, questionController.createQuestionWithAnswers);
router.post('/import', isAdmin, upload.single('excel_file'), questionController.importQuestionsFromExcel);
router.post('/bulk-delete', isAdmin, questionController.deleteBulkQuestions);
router.delete('/:id', isAdmin, questionController.deleteQuestion);
router.put('/:id', questionController.updateQuestion);

module.exports = router;