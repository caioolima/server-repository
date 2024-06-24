const mongoose = require('mongoose');

const savedPostSchema = new mongoose.Schema({
  userId: String,
  postOwnerId: String,
  imageUrl: { type: String, required: true }, // URL da imagem da publicação
  savedAt: { type: Date, default: Date.now }
});

const SavedPost = mongoose.model('SavedPost', savedPostSchema);

module.exports = SavedPost;
