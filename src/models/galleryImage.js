// models/galleryImage.js
const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  url: { type: String, required: true }, // URL da imagem da galeria, com required
  postedAt: { type: Date, default: Date.now }, // Timestamp de adição da imagem
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Referência ao usuário que possui a imagem
});

const GalleryImage = mongoose.model('GalleryImage', galleryImageSchema);

module.exports = GalleryImage;
