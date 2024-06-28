const mongoose = require('mongoose');

const userCountrySchema = new mongoose.Schema({
  country: String,
  userId: String // Usando um identificador simples como string
});

module.exports = mongoose.model('UserCountry', userCountrySchema);
