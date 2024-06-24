const express = require("express");
const router = express.Router();
const galleryController = require("../controllers/galleryController");

// Rota para adicionar uma imagem à galeria
router.post("/:userId/gallery", galleryController.addGalleryImage);

// Rota para obter todas as imagens da galeria de um usuário
router.get("/:userId/gallery", galleryController.getGalleryImages);

// Rota para deletar uma imagem da galeria pela URL
router.delete('/:userId/gallery', galleryController.deleteGalleryImageByUrl);

// Rota para curtir uma imagem da galeria
router.post("/:userId/gallery/like", galleryController.likeGalleryImage);

// Rota para descurtir uma imagem da galeria
router.post("/:userId/gallery/unlike", galleryController.unlikeGalleryImage);

// Rota para verificar se um usuário curtiu uma determinada imagem da galeria
router.post("/gallery/check-likes", galleryController.checkLikes);

// Rota para obter as imagens mais curtidas
router.get("/top-liked", galleryController.getTopLikedImages);

module.exports = router;
