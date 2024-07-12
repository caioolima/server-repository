// routes/notificationRoutes.js

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationUser');

// Rota para obter tipos de notificação e nomes de usuários que fizeram a ação
router.get('/:userId/types-and-users', notificationController.getNotificationTypesAndUsers);

// Rota para obter notificações não lidas e marcar como lidas
router.get('/:userId/unread', notificationController.getUnreadNotifications);
router.put('/:userId/read', notificationController.markNotificationsAsRead);

module.exports = router;
