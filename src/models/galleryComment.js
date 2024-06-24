const mongoose = require('mongoose');

const galleryCommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
  imageUrl: String,
  postedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GalleryComment', galleryCommentSchema);
