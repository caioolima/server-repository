const express = require('express');
const feedController = require('../controllers/feedController');

const router = express.Router();

// Rota para obter o feed
router.get('/feed/:userId', feedController.getFeed);

// Rota para curtir uma imagem do feed
router.post('/feed/:userId/like', feedController.likeFeedImage);

// Rota para descurtir uma imagem do feed
router.post('/feed/:userId/unlike', feedController.unlikeFeedImage);

// Rota para verificar os likes de uma imagem do feed
router.post('/feed/:userId/checkLikes', feedController.checkFeedImageLikes);

// Rota para obter os usernames que curtiram a imagem
router.post('/likedUsers', feedController.getLikedUsersNames);

// Rota para salvar imagem
router.post('/savePost', feedController.savePost);

// Rota para excluir uma publicação salva
router.delete('/saved', feedController.deleteSavedPost);

// Rota para obter imagens salvas
router.get('/savedPosts/:userId', feedController.getSavedPosts);

// Rota para verificar se o post está salvo
router.post('/savedPost', feedController.checkSavedPost);

// Rota para adicionar um comentário
router.post('/comment', feedController.addComment);

// Rota para obter comentários de uma imagem
router.post('/comments', feedController.getComments);

// Rota para deletar um comentário
router.delete('/comment', feedController.deleteComment);

module.exports = router;
