const express = require("express");
const router = express.Router();
const relationshipController = require("../controllers/followController");

// Rota para seguir um usuário
router.post("/relationship", relationshipController.followUser);

// Rota para deixar de seguir um usuário
router.delete(
  "/relationship/:follower_id/:following_id",
  relationshipController.unfollowUser
);

// Rota para verificar a relação entre dois usuários
router.get(
  "/relationship/:follower_id/:following_id",
  relationshipController.verifyRelationship
);

// Rota para obter o número de seguidores de um usuário
router.get(
  "/relationship/:following_id",
  relationshipController.updateUserFollowersCount
);

// **Nova rota: Obter o número de usuários que o usuário está seguindo**
router.get(
  "/user/:follower_id/following-count",
  relationshipController.getUserFollowingCount
);

// Rota para obter os seguidores de um usuário
router.get(
  "/user/:userId/followers",
  relationshipController.getUserFollowers
);

// Rota para obter os usuários que um usuário está seguindo
router.get(
  "/user/:userId/following",
  relationshipController.getUserFollowing
);

// Rota para obter os perfis com mais seguidores
router.get("/user/top-followed", relationshipController.getTopFollowedUsers);


module.exports = router;