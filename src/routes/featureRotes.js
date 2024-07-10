const express = require('express');
const router = express.Router();
const { sendFeatureRequest } = require('../controllers/featureRequestController');

// Rota para enviar solicitações de recurso
router.post('/feature', sendFeatureRequest);

module.exports = router;
