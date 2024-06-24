const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const middleware = require('../middleware/check-auth-middleware');

router.get('/', middleware.checkAuthMiddleware, profileController.findUserByToken);

module.exports = router;