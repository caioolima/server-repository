const Message = require('../models/messageModel');
const CommunityUser = require('../models/communityModel');
const UserCountry = require('../models/userCountryModel');

async function enviarMensagem(userId, communityId, message, media) {
    try {
        // Verifica se a comunidade existe
        const community = await CommunityUser.findById(communityId);
        if (!community) {
            throw new Error('Comunidade não encontrada');
        }

        // Verifica se o usuário está associado ao país da comunidade
        const userCountry = await UserCountry.findOne({ userId });
        if (!userCountry) {
            throw new Error('Usuário não encontrado');
        }

        // Verifica se o país do usuário corresponde ao país da comunidade
        if (userCountry.country !== community.country) {
            throw new Error('Usuário não está na comunidade');
        }

        let mediaUrl = media; // Assume que a mídia é um nome de arquivo local
        if (media && media.startsWith('http')) {
            // Se a mídia já for uma URL (caso seja um link do Firebase Storage), use diretamente
            mediaUrl = media;
        }

        // Cria uma nova mensagem
        const newMessage = new Message({
            userId,
            communityId, // Adiciona o ID da comunidade à mensagem
            message,
            media: mediaUrl
        });

        // Salva a nova mensagem no banco de dados
        await newMessage.save();
        return 'Mensagem enviada com sucesso';
    } catch (error) {
        return error.message;
    }
}

// Função para listar mensagens de uma comunidade
async function listarMensagens(communityId) {
    try {
        // Verifica se a comunidade existe
        const community = await CommunityUser.findById(communityId);
        if (!community) {
            throw new Error('Comunidade não encontrada');
        }

        // Busca todas as mensagens dessa comunidade
        const messages = await Message.find({ communityId }).populate('userId', 'username');
        return messages;
    } catch (error) {
        throw new Error('Erro ao listar as mensagens da comunidade: ' + error.message);
    }
}

module.exports = { enviarMensagem, listarMensagens };
