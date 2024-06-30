const GalleryImage = require("../models/galleryImage");
const Like = require("../models/like")
const Relationship = require("../models/relationShip");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const SavedPost = require("../models/savedPost");
const GalleryComment = require("../models/galleryComment");

exports.getFeed = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Obter os IDs dos usuários que o usuário segue
    const following = await Relationship.find({ follower_id: userId }).select(
      "following_id"
    );
    const followingIds = following.map((rel) => rel.following_id);

    // Incluir o próprio usuário na lista de IDs
    followingIds.push(userId);

    // Obter as publicações dos usuários que o usuário segue, incluindo ele mesmo
    const feed = await GalleryImage.find({ userId: { $in: followingIds } })
      .sort({ postedAt: -1 })
      .populate("userId", "username firstName lastName profileImageUrl"); // Populate para incluir informações do usuário

    res.status(200).json(feed);
  } catch (error) {
    console.error("Erro ao obter o feed:", error);
    res.status(500).json({ message: "Erro ao obter o feed" });
  }
};
// Curtir uma imagem do feed
exports.likeFeedImage = async (req, res) => {
  try {
    const { imageUrl, likerId } = req.body;

    const image = await GalleryImage.findOne({ url: imageUrl });

    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found." });
    }

    const existingLike = await Like.findOne({
      userId: likerId,
      galleryImageId: image._id,
    });

    if (existingLike) {
      return res
        .status(400)
        .json({ success: false, message: "You already liked this image." });
    }

    const newLike = new Like({ userId: likerId, galleryImageId: image._id });
    await newLike.save();

    return res.status(200).json({
      success: true,
      message: "Image liked successfully.",
    });
  } catch (error) {
    console.error("Error liking feed image:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while liking feed image.",
    });
  }
};

// Descurtir uma imagem do feed
exports.unlikeFeedImage = async (req, res) => {
  try {
    const { imageUrl, likerId } = req.body;

    const image = await GalleryImage.findOne({ url: imageUrl });

    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found." });
    }

    const existingLike = await Like.findOne({
      userId: likerId,
      galleryImageId: image._id,
    });

    if (!existingLike) {
      return res
        .status(400)
        .json({ success: false, message: "You have not liked this image." });
    }

    await existingLike.remove();

    return res.status(200).json({
      success: true,
      message: "Like removed successfully.",
    });
  } catch (error) {
    console.error("Error unliking feed image:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while unliking feed image.",
    });
  }
};
exports.checkFeedImageLikes = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const userId = req.params.userId; // Obtém o userId da URL

    const image = await GalleryImage.findOne({ url: imageUrl });

    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found." });
    }

    const likes = await Like.find({ galleryImageId: image._id }).select("userId");
    const likedUserIds = likes.map((like) => like.userId.toString()); // Converte ObjectId para string
    const isLikedByUser = likedUserIds.includes(userId); // Compara com userId como string

    return res.status(200).json({ success: true, likedUserIds, isLikedByUser });
  } catch (error) {
    console.error("Error checking feed image likes:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while checking feed image likes.",
    });
  }
};


exports.getLikedUsersNames = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    // Encontrar a imagem pelo URL
    const image = await GalleryImage.findOne({ url: imageUrl });

    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found." });
    }

    // Extrair os IDs dos usuários que curtiram a imagem
    const likedUserIds = image.likes;

    // Converter os IDs para ObjectId
    const objectIdLikedUserIds = likedUserIds
      .filter((id) => id.length === 24) // Filtrar IDs com comprimento correto
      .map((id) => mongoose.Types.ObjectId.createFromHexString(id));

    // Encontrar os usuários com base nos IDs
    const likedUsers = await User.find({ _id: { $in: objectIdLikedUserIds } });

    // Extrair os nomes dos usuários
    const likedUsersNames = likedUsers.map((user) => ({
      userId: user._id,
      username: user.username,
      profileImageUrl: user.profileImageUrl,
    }));

    return res.status(200).json({ success: true, likedUsersNames });
  } catch (error) {
    console.error("Error getting liked users names:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while getting liked users names.",
    });
  }
};

// Controlador para salvar uma publicação
exports.savePost = async (req, res) => {
  try {
    const { userId, postOwnerId, imageUrl } = req.body;

    // Verificar se a publicação já foi salva pelo usuário
    const existingSavedPost = await SavedPost.findOne({
      userId,
      postOwnerId,
      imageUrl,
    });
    if (existingSavedPost) {
      return res
        .status(400)
        .json({ success: false, message: "Post already saved." });
    }

    // Criar um novo documento de savedPost
    const newSavedPost = new SavedPost({ userId, postOwnerId, imageUrl });
    await newSavedPost.save();

    return res
      .status(200)
      .json({ success: true, message: "Post saved successfully." });
  } catch (error) {
    console.error("Error saving post:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error while saving post.",
      });
  }
};

exports.deleteSavedPost = async (req, res) => {
  try {
    const { userId, imageUrl } = req.body;

    // Encontrar e deletar a publicação salva pelo usuário
    const deletedPost = await SavedPost.findOneAndDelete({ userId, imageUrl });

    if (!deletedPost) {
      return res
        .status(404)
        .json({ success: false, message: "Saved post not found." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Saved post deleted successfully." });
  } catch (error) {
    console.error("Error deleting saved post:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error while deleting saved post.",
      });
  }
};

// Controlador para obter as publicações salvas de um usuário
exports.getSavedPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Encontrar todas as publicações salvas pelo usuário
    const savedPosts = await SavedPost.find({ userId });

    // Mapear as publicações salvas e adicionar o nome de usuário do dono do post
    const populatedSavedPosts = await Promise.all(
      savedPosts.map(async (savedPost) => {
        // Encontrar o usuário pelo ID do dono do post
        const user = await User.findById(savedPost.postOwnerId);
        // Extrair o nome de usuário
        const username = user.username;
        // Retornar a publicação salva com o nome de usuário incluído
        return { ...savedPost.toObject(), username };
      })
    );

    return res
      .status(200)
      .json({ success: true, savedPosts: populatedSavedPosts });
  } catch (error) {
    console.error("Error getting saved posts:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error while getting saved posts.",
      });
  }
};

exports.checkSavedPost = async (req, res) => {
  try {
    const { userId, imageUrl } = req.body;

    // Verificar se a imagem foi salva pelo usuário
    const savedPost = await SavedPost.findOne({ userId, imageUrl });

    // Se a imagem estiver salva, retornar true, caso contrário, retornar false
    const isSaved = !!savedPost;

    return res.status(200).json({ success: true, isSaved });
  } catch (error) {
    console.error("Error checking saved post:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error while checking saved post.",
      });
  }
};

// Função para adicionar um comentário
exports.addComment = async (req, res) => {
  try {
    const { userId, imageUrl, text } = req.body;

    const newComment = new GalleryComment({
      userId,
      imageUrl,
      text,
    });

    await newComment.save();

    // Atualizar a imagem para incluir o comentário
    await GalleryImage.findOneAndUpdate(
      { url: imageUrl },
      { $push: { comments: newComment._id } }
    );

    return res
      .status(200)
      .json({
        success: true,
        message: "Comment added successfully.",
        comment: newComment,
      });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error while adding comment.",
      });
  }
};

// Função para obter comentários de uma imagem
exports.getComments = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    const comments = await GalleryComment.find({ imageUrl })
      .populate({
        path: "userId",
        select: "username profileImageUrl", // Seleciona os campos a serem populados
      })
      .sort({ postedAt: -1 });

    return res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error("Error getting comments:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error while getting comments.",
      });
  }
};

// Função para deletar um comentário
exports.deleteComment = async (req, res) => {
  try {
    const { commentId, userId } = req.body;

    const comment = await GalleryComment.findById(commentId);

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found." });
    }

    if (comment.userId.toString() !== userId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to delete this comment.",
        });
    }

    await GalleryComment.deleteOne({ _id: commentId });

    // Atualizar a imagem para remover a referência ao comentário deletado
    await GalleryImage.findOneAndUpdate(
      { url: comment.imageUrl },
      { $pull: { comments: commentId } }
    );

    return res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully." });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error while deleting comment.",
      });
  }
};
