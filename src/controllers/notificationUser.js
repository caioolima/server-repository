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

// Função para obter notificações não lidas
exports.getUnreadNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    // Obtenha todas as notificações do usuário que não foram lidas
    const notifications = await Notification.find({ userId, read: false })
      .populate({
        path: 'referenceId',
        select: 'username profileImageUrl',
      })
      .sort({ createdAt: -1 });

    const formattedNotifications = notifications.map(notification => ({
      type: notification.type,
      username: notification.referenceId ? notification.referenceId.username : 'Unknown',
      profileImageUrl: notification.referenceId ? notification.referenceId.profileImageUrl : 'Unknown',
      createdAt: notification.createdAt,
    }));

    res.status(200).json({ success: true, notifications: formattedNotifications });
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while getting unread notifications.',
    });
  }
};

// Função para marcar notificações como lidas
exports.markNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    // Encontre todas as notificações não lidas para o usuário
    const notifications = await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ success: true, message: 'Notifications marked as read.' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while marking notifications as read.',
    });
  }
};