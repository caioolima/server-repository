// messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const multer = require('multer'); // Importe o multer
const upload = multer({ dest: 'uploads/' });

// Rota para enviar uma mensagem (texto ou mídia) para a comunidade
router.post('/enviar-mensagem/:userId/:communityId', async (req, res) => {
    const { userId, communityId } = req.params;
    const { message, media } = req.body;

    try {
        const result = await messageController.enviarMensagem(userId, communityId, message, media);
        res.status(200).json({ message: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Rota para listar mensagens da comunidade
router.get('/mensagens/:communityId', async (req, res) => {
    const { communityId } = req.params;

    try {
        const messages = await messageController.listarMensagens(communityId);
        res.status(200).json(messages);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
