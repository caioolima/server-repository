const GalleryImage = require("../models/galleryImage");
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

exports.likeGalleryImage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { url, likerId } = req.body;

    const image = await GalleryImage.findOne({ userId, url });

    if (!image) {
      return res.status(404).json({ success: false, message: "Gallery image not found." });
    }

    if (image.likes.includes(likerId)) {
      return res.status(400).json({ success: false, message: "You already liked this image." });
    }

    image.likes.push(likerId);
    await image.save();

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

    const likerIndex = image.likes.indexOf(likerId);
    if (likerIndex === -1) {
      return res.status(400).json({ success: false, message: "You have not liked this image." });
    }

    image.likes.splice(likerIndex, 1);
    await image.save();

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

exports.checkLikes = async (req, res) => {
  try {
    const { imageUrl, targetUserId } = req.body;

    const image = await GalleryImage.findOne({ url: imageUrl });

    if (!image) {
      return res.status(404).json({ success: false, message: "Gallery image not found." });
    }

    // Verificar se o ID do usuário alvo está presente na lista de IDs dos usuários que curtiram a imagem
    const isLikedByUser = image.likes.includes(targetUserId);

    // Retornar a lista completa de IDs dos usuários que curtiram a imagem
    const likedUserIds = image.likes;

    return res.status(200).json({ success: true, likedUserIds, isLikedByUser });
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
    // Buscar imagens que tenham pelo menos um like e popular o campo userId
    const images = await GalleryImage.find({ 'likes.0': { $exists: true } })
      .sort({ 'likes.length': -1 })
      .limit(10)
      .populate('userId', 'username profileImageUrl'); // Populando os campos username e profileImageUrl do usuário

    const topLikedImages = images.map(image => ({
      ...image.toObject(),
      likeCount: image.likes.length,
      username: image.userId.username, // Adicionando o campo username ao objeto de imagem
      profileImageUrl: image.userId.profileImageUrl // Adicionando o campo profileImageUrl ao objeto de imagem
    }));

    return res.status(200).json({ success: true, topLikedImages });
  } catch (error) {
    console.error("Error getting top liked images:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while getting top liked images.",
    });
  }
};