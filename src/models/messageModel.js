// messageModel.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  userId: String,
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityUser' }, // Adiciona o ID da comunidade
  message: String,
  media: String,
  timestamp: { type: Date, default: Date.now } // Adiciona um campo de timestamp
});

module.exports = mongoose.model('Message', MessageSchema);
