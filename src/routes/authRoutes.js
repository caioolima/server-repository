// Dentro do authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rotas de autenticação
router.post('/auth/register', authController.registerUser);
router.post('/auth/login', authController.loginUser);
router.post('/auth/checkAvailability', authController.checkFieldAvailability);

// Rota para buscar o nome de usuário pelo ID
router.get('/auth/user/:userId/username', authController.getUsernameById);

// Rotas de reset
router.post('/auth/requestPasswordReset', authController.requestPasswordReset);
router.post('/auth/resetPassword/:token', authController.resetPassword);

// Rota para verificar o código
router.post('/auth/verifyCode', authController.verifyResetCode);

// Nova rota para obter a preferência de idioma
router.get("/auth/:userId/language", authController.getUserLanguage); 

// Nova rota para atualizar a preferência de idioma
router.post("/auth/language", authController.updateUserLanguage); 

// Nova rota para solicitar a exclusão de conta
router.post('/auth/requestAccountDeletion', authController.requestAccountDeletion);

module.exports = router;