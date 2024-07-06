const nodemailer = require('nodemailer');
require('dotenv').config(); // Carregar variáveis de ambiente do arquivo .env

// Crie um transportador usando o serviço SMTP do Outlook
const transporter = nodemailer.createTransport({
  service: 'Outlook365', // Ou 'hotmail', dependendo do serviço de e-mail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = transporter;
