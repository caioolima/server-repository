// controllers/notificationController.js
const mongoose = require('mongoose');
const cron = require('node-cron');
const Notification = require('../models/notification'); // Importe o modelo Notification

// Função para excluir notificações antigas
const deleteOldNotifications = async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); // Tempo de 24 horas atrás
    const result = await Notification.deleteMany({ createdAt: { $lt: oneDayAgo } });
    console.log(`Deleted ${result.deletedCount} old notifications.`);
  } catch (error) {
    console.error('Error deleting old notifications:', error);
  }
};

// Configura o intervalo para apagar notificações a cada 24 horas
cron.schedule('0 0 * * *', deleteOldNotifications); // Executa a cada 24 horas, à meia-noite

exports.getNotificationTypesAndUsers = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ userId })
      .populate({
        path: 'referenceId', // O usuário que fez a ação
        select: 'username profileImageUrl', // Inclui o campo profileImageUrl
      })
      .sort({ createdAt: -1 });

    // Mapeia as notificações para incluir o tipo, nome de usuário, imagem de perfil e a data/hora
    const formattedNotifications = notifications.map(notification => ({
      type: notification.type,
      username: notification.referenceId ? notification.referenceId.username : 'Unknown',
      profileImageUrl: notification.referenceId ? notification.referenceId.profileImageUrl : 'Unknown',
      createdAt: notification.createdAt, // Adiciona a data/hora da criação da notificação
    }));

    console.log(formattedNotifications); // Verifique os dados retornados

    res.status(200).json({ success: true, notifications: formattedNotifications });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while getting notifications.',
    });
  }
};
