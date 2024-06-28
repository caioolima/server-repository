const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const middleware = require("../middleware/check-auth-middleware");

// Rota para encontrar usuário por ID
router.get("/:id", middleware.checkAuthMiddleware, userController.findUserById);

// Rota para adicionar a biografia
router.post(
  "/:id/biography",
  middleware.checkAuthMiddleware,
  userController.addUserBiography
);

// Rota para atualizar a biografia
router.put(
  "/:id/biography",
  middleware.checkAuthMiddleware,
  userController.updateUserBiography
);

// Rota para verificar se o usuário possui uma biografia
router.get(
  "/:id/check-biography",
  middleware.checkAuthMiddleware,
  userController.checkUserBiography
);

// Rota para deletar a biografia
router.delete(
  "/:id/biography",
  middleware.checkAuthMiddleware,
  userController.deleteUserBiography
);

// Rota para atualizar o nome de usuário, biografia e nome completo
router.put(
  "/:id/edit",
  middleware.checkAuthMiddleware,
  userController.updateUserProfile
);

// Rota para adicionar a imagem de perfil do usuário
router.post(
  "/:id/profile-image",
  middleware.checkAuthMiddleware,
  userController.addUserProfileImage
);

// Rota para atualizar a imagem de perfil do usuário
router.put(
  "/:id/edit",
  middleware.checkAuthMiddleware,
  userController.updateUserProfile
);

// Rota para excluir a imagem de perfil do usuário
router.delete(
  "/:id/profile-image",
  middleware.checkAuthMiddleware,
  userController.deleteUserProfileImage
);

// Rota para encontrar todos os usuários
router.get("/find/:username", userController.findAllUsers);

// Rota para obter todas as fotos de perfil por ID do usuário
router.get("/:id/profile-images", userController.getAllProfileImagesById);

module.exports = router;
