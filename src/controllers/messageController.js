// messageController.js
const Message = require('../models/messageModel');
const CommunityUser = require('../models/communityModel');

// Função para enviar uma mensagem
async function enviarMensagem(userId, communityId, message, media) {
    try {
        const community = await CommunityUser.findById(communityId);
        if (!community) {
            throw new Error('Comunidade não encontrada');
        }

        // Verifica se o usuário está na comunidade
        if (!community.userCountry.includes(userId)) {
            throw new Error('Usuário não está na comunidade');
        }

        let mediaUrl = media; // Assume que a mídia é um nome de arquivo local
        if (media && media.startsWith('http')) {
            // Se a mídia já for uma URL (caso seja um link do Firebase Storage), use diretamente
            mediaUrl = media;
        }

        const newMessage = new Message({
            userId,
            communityId, // Adiciona o ID da comunidade à mensagem
            message,
            media: mediaUrl
        });

        await newMessage.save();
        return 'Mensagem enviada com sucesso';
    } catch (error) {
        return error.message;
    }
}

// Função para listar mensagens de uma comunidade
async function listarMensagens(communityId) {
    try {
        const community = await CommunityUser.findById(communityId);
        if (!community) {
            throw new Error('Comunidade não encontrada');
        }

        // Busca todas as mensagens dessa comunidade
        const messages = await Message.find({ communityId: communityId }).populate('userId', 'username');
        return messages;
    } catch (error) {
        throw new Error('Erro ao listar as mensagens da comunidade: ' + error.message);
    }
}

module.exports = { enviarMensagem, listarMensagens };
