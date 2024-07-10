const mongoose = require('mongoose');

const featureRequestSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: [/\S+@\S+\.\S+/, 'Por favor, insira um e-mail válido']
  },
  feature: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['en', 'en-US', 'pt', 'pt-BR', 'es', 'es-ES'], // Atualize os valores válidos aqui
    message: 'Idioma inválido'
  }
}, { timestamps: true });

const FeatureRequest = mongoose.model('FeatureRequest', featureRequestSchema);

module.exports = FeatureRequest;
