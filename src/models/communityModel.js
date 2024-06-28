const mongoose = require('mongoose');

const CommunityUserSchema = new mongoose.Schema({
  country: String,
  image: String
});

module.exports = mongoose.model('CommunityUser', CommunityUserSchema);
