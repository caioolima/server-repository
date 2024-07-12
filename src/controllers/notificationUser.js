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

    // Filtra as notificações em que referenceId é igual a userId
    const filteredNotifications = notifications.filter(notification => {
      return notification.referenceId && notification.referenceId._id.toString() !== userId;
    });

    // Mapeia as notificações para incluir o tipo, nome de usuário, imagem de perfil e a data/hora
    const formattedNotifications = filteredNotifications.map(notification => ({
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

// Função para obter notificações não lidas e marcar como lidas
exports.getUnreadNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    // Obtém todas as notificações do usuário
    const notifications = await Notification.find({ userId })
      .populate({
        path: 'referenceId', // O usuário que fez a ação
        select: 'username profileImageUrl', // Inclui o campo profileImageUrl
      })
      .sort({ createdAt: -1 });

    // Filtra as notificações em que referenceId é diferente de userId
    const filteredNotifications = notifications.filter(notification => {
      return notification.referenceId && notification.referenceId._id.toString() !== userId;
    });

    // Obtém apenas as notificações não lidas
    const unreadNotifications = filteredNotifications.filter(notification => !notification.read);

    // Marca todas as notificações não lidas como lidas
    await Promise.all(unreadNotifications.map(async notification => {
      notification.read = true;
      await notification.save();
    }));

    console.log('Unread notifications:', unreadNotifications); // Log para depuração

    const formattedNotifications = unreadNotifications.map(notification => ({
      type: notification.type,
      username: notification.referenceId ? notification.referenceId.username : 'Unknown',
      profileImageUrl: notification.referenceId ? notification.referenceId.profileImageUrl : 'Unknown',
      createdAt: notification.createdAt,
    }));

    res.status(200).json({ success: true, notifications: formattedNotifications });
  } catch (error) {
    console.error('Error getting or marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while getting or marking notifications as read.',
    });
  }
};
