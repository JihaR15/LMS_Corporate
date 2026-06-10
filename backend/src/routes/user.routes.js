const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.use(verifyToken, isAdmin);

router.post('/', userController.createUser);
router.get('/operators', userController.getAllOperators);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deactivateUser); // Menggunakan soft-delete
router.get('/:id/rapor', userController.getUserRapor);

module.exports = router;