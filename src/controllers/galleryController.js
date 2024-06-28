const GalleryImage = require("../models/galleryImage");
const Like = require("../models/like");
const User = require("../models/userModel");

// Adicionar uma imagem à galeria
exports.addGalleryImage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, message: "Image URL is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const newImage = new GalleryImage({
      url,
      userId
    });

    await newImage.save();

    return res.status(201).json({
      success: true,
      message: "Gallery image added successfully.",
      image: newImage
    });
  } catch (error) {
    console.error("Error adding gallery image:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding gallery image.",
    });
  }
};

// Obter todas as imagens da galeria de um usuário
exports.getGalleryImages = async (req, res) => {
  try {
    const { userId } = req.params;

    const images = await GalleryImage.find({ userId }).sort({ postedAt: -1 });

    if (images.length === 0) {
      return res.status(404).json({ success: false, message: "No gallery images found." });
    }

    return res.status(200).json({ success: true, images });
  } catch (error) {
    console.error("Error getting gallery images:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while getting gallery images.",
    });
  }
};


// Deletar uma imagem da galeria pela URL
exports.deleteGalleryImageByUrl = async (req, res) => {
  try {
    const { userId } = req.params;
    const { url } = req.body;

    // Verificar se a URL foi fornecida
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL da imagem não fornecida.',
      });
    }

    // Encontrar e deletar a imagem com a URL fornecida
    const image = await GalleryImage.findOneAndDelete({ url, userId });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagem da galeria não encontrada ou não pertencente ao usuário.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Imagem da galeria deletada com sucesso.',
    });
  } catch (error) {
    console.error('Erro ao deletar a imagem da galeria:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao deletar a imagem da galeria.',
    });
  }
};

// Curtir uma imagem da galeria

// Curtir uma imagem da galeria
exports.likeGalleryImage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { url, likerId } = req.body;

    const image = await GalleryImage.findOne({ userId, url });

    if (!image) {
      return res.status(404).json({ success: false, message: "Gallery image not found." });
    }

    const existingLike = await Like.findOne({ userId: likerId, galleryImageId: image._id });
    if (existingLike) {
      return res.status(400).json({ success: false, message: "You already liked this image." });
    }

    const newLike = new Like({
      userId: likerId,
      galleryImageId: image._id
    });

    await newLike.save();

    return res.status(200).json({
      success: true,
      message: "Image liked successfully.",
    });
  } catch (error) {
    console.error("Error liking gallery image:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while liking gallery image.",
    });
  }
};

// Descurtir uma imagem da galeria
exports.unlikeGalleryImage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { url, likerId } = req.body;

    const image = await GalleryImage.findOne({ userId, url });

    if (!image) {
      return res.status(404).json({ success: false, message: "Gallery image not found." });
    }

    const existingLike = await Like.findOneAndDelete({ userId: likerId, galleryImageId: image._id });

    if (!existingLike) {
      return res.status(400).json({ success: false, message: "You have not liked this image." });
    }

    return res.status(200).json({
      success: true,
      message: "Like removed successfully.",
    });
  } catch (error) {
    console.error("Error unliking gallery image:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while unliking gallery image.",
    });
  }
};


// Verificar likes
exports.checkLikes = async (req, res) => {
  try {
    const { imageUrl, targetUserId } = req.body;

    const image = await GalleryImage.findOne({ url: imageUrl });

    if (!image) {
      return res.status(404).json({ success: false, message: "Gallery image not found." });
    }

    const like = await Like.findOne({ userId: targetUserId, galleryImageId: image._id });

    const isLikedByUser = !!like;
    const likedUserIds = await Like.find({ galleryImageId: image._id }).select('userId');

    return res.status(200).json({
      success: true,
      likedUserIds: likedUserIds.map(like => like.userId),
      isLikedByUser
    });
  } catch (error) {
    console.error("Error checking likes:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while checking likes.",
    });
  }
};


// Obter as imagens mais curtidas com pelo menos 1 like
exports.getTopLikedImages = async (req, res) => {
  try {
    // Buscar todas as imagens da galeria
    const allImages = await GalleryImage.find().populate('userId', 'username profileImageUrl');

    // Adicionar a contagem de likes para cada imagem
    const imagesWithLikes = await Promise.all(allImages.map(async (image) => {
      const likeCount = await Like.countDocuments({ galleryImageId: image._id });
      return { ...image.toObject(), likeCount };
    }));

    // Filtrar as imagens que têm pelo menos um like e ordenar por contagem de likes
    const topLikedImages = imagesWithLikes
      .filter(image => image.likeCount > 0)
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 10);

    return res.status(200).json({ success: true, topLikedImages });
  } catch (error) {
    console.error("Error getting top liked images:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while getting top liked images.",
    });
  }
};
