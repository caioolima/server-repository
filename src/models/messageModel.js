const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Referência ao usuário
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityUser' }, // Referência à comunidade
  message: String,
  media: String,
  timestamp: { type: Date, default: Date.now } // Adiciona um campo de timestamp
});

module.exports = mongoose.model('Message', MessageSchema);
