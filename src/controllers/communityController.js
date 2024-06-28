const CommunityUser = require('../models/communityModel');
const UserCountry = require('../models/userCountryModel');

// Função para adicionar um usuário a uma comunidade
async function entrarNaComunidade(userId, communityId) {
    try {
        const community = await CommunityUser.findById(communityId);
        if (!community) {
            throw new Error('Comunidade não encontrada');
        }

        // Verifica se o usuário já está na comunidade
        const existingEntry = await UserCountry.findOne({ userId, country: community.country });
        if (existingEntry) {
            throw new Error('Usuário já está na comunidade');
        }

        // Adiciona o usuário à comunidade
        const userCountry = new UserCountry({ country: community.country, userId });
        await userCountry.save();
        
        return 'Usuário adicionado à comunidade com sucesso';
    } catch (error) {
        return error.message;
    }
}

// Função para remover um usuário de uma comunidade
async function sairDaComunidade(userId, communityId) {
    try {
        const community = await CommunityUser.findById(communityId);
        if (!community) {
            throw new Error('Comunidade não encontrada');
        }

        // Verifica se o usuário está na comunidade
        const existingEntry = await UserCountry.findOne({ userId, country: community.country });
        if (!existingEntry) {
            throw new Error('Usuário não está na comunidade');
        }

        // Remove o usuário da comunidade
        await UserCountry.deleteOne({ userId, country: community.country });

        return 'Usuário removido da comunidade com sucesso';
    } catch (error) {
        return error.message;
    }
}

// Função para criar uma nova comunidade
async function criarComunidade(country, userId, image = null) {
    try {
        // Verifica se já existe uma comunidade com o mesmo país
        const existingCommunity = await CommunityUser.findOne({ country });
        if (existingCommunity) {
            throw new Error('Já existe uma comunidade com este nome');
        }

        const novaComunidade = new CommunityUser({ 
            country, 
            image 
        });

        await novaComunidade.save();

        // Adiciona o usuário criador à nova comunidade
        const userCountry = new UserCountry({ country, userId });
        await userCountry.save();

        return novaComunidade._id; // Retorna o ID da nova comunidade criada
    } catch (error) {
        throw new Error(error.message);
    }
}


// Função para listar todas as comunidades
async function listarComunidades() {
    try {
        // Busca todas as comunidades no banco de dados
        const comunidades = await CommunityUser.find();
        return comunidades;
    } catch (error) {
        throw new Error('Erro ao listar as comunidades: ' + error.message);
    }
}

// Função para verificar se o usuário está na comunidade
async function verificarMembroDaComunidade(userId, communityId) {
    try {
        const community = await CommunityUser.findById(communityId);
        if (!community) {
            throw new Error('Comunidade não encontrada');
        }

        // Verifica se o usuário está na comunidade
        const isMember = await UserCountry.exists({ userId, country: community.country });

        return isMember;
    } catch (error) {
        throw new Error('Erro ao verificar a associação do usuário com a comunidade: ' + error.message);
    }
}

// Função para contar o número de usuários dentro de uma comunidade
async function contarMembrosDaComunidade(communityId) {
    try {
        const community = await CommunityUser.findById(communityId);
        if (!community) {
            throw new Error('Comunidade não encontrada');
        }

        const numberOfMembers = await UserCountry.countDocuments({ country: community.country });

        return numberOfMembers;
    } catch (error) {
        throw new Error('Erro ao contar os membros da comunidade: ' + error.message);
    }
}


// Função para obter as comunidades do usuário
async function obterComunidadesDoUsuario(userId) {
    try {
        // Encontra todas as comunidades em que o usuário está associado
        const userCountries = await UserCountry.find({ userId });
        const comunidadesDoUsuario = await CommunityUser.find({ country: { $in: userCountries.map(uc => uc.country) } });
        return comunidadesDoUsuario;
    } catch (error) {
        throw new Error('Erro ao obter as comunidades do usuário: ' + error.message);
    }
}

module.exports = { entrarNaComunidade, sairDaComunidade, criarComunidade, listarComunidades, verificarMembroDaComunidade, contarMembrosDaComunidade, obterComunidadesDoUsuario };
