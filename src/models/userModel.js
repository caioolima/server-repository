const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  phone: String,
  email: String,
  dob: Date,
  gender: String,
  biography: String,
  profileImageUrl: String,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  verificationCode: String,
  language: { type: String, default: 'pt-BR' },
  deletionRequestedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now } // Novo campo para data de criação
});

const User = mongoose.model('User', userSchema);

module.exports = User;
