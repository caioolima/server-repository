// communityController.js
const CommunityUser = require('../models/communityModel');

// Função para adicionar um usuário a uma comunidade
async function entrarNaComunidade(userId, communityId) {
    try {
        const community = await CommunityUser.findById(communityId);
        if (!community) {
            throw new Error('Comunidade não encontrada');
        }

        // Verifica se o usuário já está na comunidade
        if (community.userCountry.includes(userId)) {
            throw new Error('Usuário já está na comunidade');
        }

        // Adiciona o usuário à comunidade
        community.userCountry.push(userId);
        await community.save();
        
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
        const index = community.userCountry.indexOf(userId);
        if (index === -1) {
            throw new Error('Usuário não está na comunidade');
        }

        // Remove o usuário da comunidade
        community.userCountry.splice(index, 1);
        await community.save();

        return 'Usuário removido da comunidade com sucesso';
    } catch (error) {
        return error.message;
    }
}

// Função para criar uma nova comunidade
async function criarComunidade(country, userId, image = null) {
    try {
        const novaComunidade = new CommunityUser({ 
            country, 
            userCountry: [userId],
            image 
        });

        await novaComunidade.save();
        return novaComunidade._id; // Retorna o ID da nova comunidade criada
    } catch (error) {
        return error.message;
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
        const isMember = community.userCountry.includes(userId);

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

        const numberOfMembers = community.userCountry.length;

        return numberOfMembers;
    } catch (error) {
        throw new Error('Erro ao contar os membros da comunidade: ' + error.message);
    }
}

// Função para obter as comunidades do usuário
async function obterComunidadesDoUsuario(userId) {
    try {
        // Encontra todas as comunidades em que o usuário está associado
        const comunidadesDoUsuario = await CommunityUser.find({ userCountry: userId });
        return comunidadesDoUsuario;
    } catch (error) {
        throw new Error('Erro ao obter as comunidades do usuário: ' + error.message);
    }
}

module.exports = { entrarNaComunidade, sairDaComunidade, criarComunidade, listarComunidades, verificarMembroDaComunidade, contarMembrosDaComunidade, obterComunidadesDoUsuario  };
