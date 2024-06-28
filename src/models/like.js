// models/like.js
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Referência ao usuário que curtiu
  galleryImageId: { type: mongoose.Schema.Types.ObjectId, ref: 'GalleryImage', required: true } // Referência à imagem da galeria que foi curtida
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
