const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const materialController = require('../controllers/material.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.use(verifyToken);

router.get('/module/:module_id', materialController.getMaterialsByModule);
router.post('/', isAdmin, upload.single('file'), materialController.createMaterial);
router.delete('/:id', isAdmin, materialController.deleteMaterial);
router.put('/reorder', isAdmin, materialController.reorderMaterials);
router.put('/:id', isAdmin, upload.single('file'), materialController.updateMaterial);

module.exports = router;