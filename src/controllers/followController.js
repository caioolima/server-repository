const Relationship = require("../models/relationShip");
const User = require("../models/userModel")
const express = require("express");

exports.followUser = async (req, res) => {
  const { follower_id, following_id } = req.body;

  try {
    // Verificar se já existe uma relação entre o seguidor e o usuário seguido
    const existingRelationship = await Relationship.findOne({
      follower_id,
      following_id,
    });

    if (existingRelationship) {
      return res
        .status(400)
        .json({ error: "Você já está seguindo este usuário" });
    }

    // Criação de uma nova instância de Relationship
    const newRelationship = new Relationship({
      follower_id,
      following_id,
    });

    // Salvar a nova relação no banco de dados
    await newRelationship.save();

    res.status(200).json(newRelationship);
  } catch (error) {
    console.error("Ocorreu um erro:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

exports.unfollowUser = async (req, res) => {
  const { follower_id, following_id } = req.params;

  try {
    // Encontre e exclua o relacionamento de seguidor com base nos IDs fornecidos
    const deletedRelationship = await Relationship.findOneAndDelete({
      follower_id,
      following_id,
    });

    if (!deletedRelationship) {
      return res
        .status(404)
        .json({ error: "Relacionamento de seguidor não encontrado" });
    }

    res.status(200).json({ message: "Deixou de seguir o usuário com sucesso" });
  } catch (error) {
    console.error("Ocorreu um erro:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

exports.verifyRelationship = async (req, res) => {
  const { follower_id, following_id } = req.params;

  try {
    // Verificar se existe uma relação entre o seguidor e o usuário seguido
    const existingRelationship = await Relationship.findOne({
      follower_id,
      following_id,
    });

    if (existingRelationship) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Ocorreu um erro:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

exports.updateUserFollowersCount = async (req, res) => {
  try {
    const { following_id } = req.params;

    // Atualizar o contador de seguidores

    const numberOfFollowers = await Relationship.countDocuments({
      following_id: following_id,
    });

    // Enviar o número de seguidores como resposta
    return res.status(200).json({ numberOfFollowers });
  } catch (error) {
    console.error(
      "Erro ao atualizar o contador de seguidores do usuário:",
      error
    );
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

exports.getUserFollowingCount = async (req, res) => {
  try {
    const { follower_id } = req.params;

    // Contar o número de documentos na coleção Relationship onde o follower_id é igual ao ID do usuário
    const numberOfFollowing = await Relationship.countDocuments({
      follower_id,
    });

    // Retornar o número de usuários que o usuário está seguindo
    return res.status(200).json({ numberOfFollowing });
  } catch (error) {
    console.error(
      "Erro ao obter o número de usuários que o usuário está seguindo:",
      error
    );
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

exports.getUserFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    // Encontre todos os relacionamentos onde o following_id é igual ao ID do usuário
    const followers = await Relationship.find({ following_id: userId });

    // Extrair apenas os IDs dos seguidores
    const followerIds = followers.map((follower) => follower.follower_id);

    // Consultar o banco de dados para obter os detalhes dos seguidores com base nos IDs
    const followerDetails = await User.find({ _id: { $in: followerIds } });

    res.status(200).json({ followers: followerDetails });
  } catch (error) {
    console.error("Erro ao obter os seguidores do usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

exports.getUserFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    // Encontre todos os relacionamentos onde o follower_id é igual ao ID do usuário
    const following = await Relationship.find({ follower_id: userId });

    // Extrair apenas os IDs dos usuários seguidos
    const followingIds = following.map((followee) => followee.following_id);

    // Consultar o banco de dados para obter os detalhes dos usuários seguidos com base nos IDs
    const followingDetails = await User.find({ _id: { $in: followingIds } });

    res.status(200).json({ following: followingDetails });
  } catch (error) {
    console.error("Erro ao obter os usuários seguidos pelo usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

exports.getTopFollowedUsers = async (req, res) => {
  try {
    // Encontrar todos os usuários
    const allUsers = await User.find();

    // Mapear os IDs dos usuários para um objeto onde a chave é o ID do usuário e o valor é 0 (para contar os seguidores)
    const userFollowersCount = allUsers.reduce((acc, user) => {
      acc[user._id] = 0;
      return acc;
    }, {});

    // Encontrar todos os relacionamentos
    const allRelationships = await Relationship.find();

    // Contar os seguidores para cada usuário
    allRelationships.forEach((relationship) => {
      userFollowersCount[relationship.following_id]++;
    });

    // Converter o objeto em um array de pares chave-valor
    const userFollowersCountArray = Object.entries(userFollowersCount);

    // Filtrar usuários com 0 seguidores
    const usersWithFollowers = userFollowersCountArray.filter(([userId, numberOfFollowers]) => numberOfFollowers > 0);

    // Ordenar o array por número de seguidores em ordem decrescente
    usersWithFollowers.sort((a, b) => b[1] - a[1]);

    // Pegar os top 10 usuários com mais seguidores
    const topFollowedUsers = usersWithFollowers.slice(0, 10);

    const topFollowedUsersDetails = await Promise.all(
      topFollowedUsers.map(async ([userId, numberOfFollowers]) => {
        const userDetails = await User.findById(userId);
        return {
          userId: userDetails._id,
          username: userDetails.username,
          profileImageUrl: userDetails.profileImageUrl,
          numberOfFollowers,
        };
      })
    );

    res.status(200).json({ topFollowedUsers: topFollowedUsersDetails });
  } catch (error) {
    console.error("Erro ao obter os perfis com mais seguidores:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};