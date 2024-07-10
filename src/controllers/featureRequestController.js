const FeatureRequest = require('../models/featureRequestModel');
const transporter = require('../config/mailer'); // Verifique o caminho correto

const languageMapping = {
  'en-US': 'en',
  'pt-BR': 'pt',
  'es-ES': 'es',
  // Adicione outras mapeações conforme necessário
};

const sendFeatureRequest = async (req, res) => {
  const { email, feature, details, language } = req.body;

  // Verifique se todos os campos necessários estão presentes
  if (!email || !feature || !details || !language) {
    return res.status(400).json({ message: 'E-mail, feature, detalhes e idioma são obrigatórios.' });
  }

  // Normalizar o idioma
  const normalizedLanguage = languageMapping[language] || language;
  const validLanguages = ['en', 'pt', 'es'];
  if (!validLanguages.includes(normalizedLanguage)) {
    return res.status(400).json({ message: 'Idioma inválido.' });
  }

  // Configure as opções do e-mail
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "caiolimaa2002@gmail.com",
    subject: normalizedLanguage === 'pt' ? 'Novo Chamado de Feature Request' : normalizedLanguage === 'es' ? 'Nueva Solicitud de Funcionalidad' : 'New Feature Request',
    html: `
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@100;400;500;600;700&display=swap');
          body {
            font-family: 'Raleway', sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
          }
          .container {
            max-width: 600px;
            margin: auto;
            padding: 20px;
            border-radius: 8px;
            background-color: #ea4f97;
            color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .logo {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo h1 {
            color: white;
            font-weight: 700;
            font-size: 36px;
            margin: 0;
          }
          h2 {
            color: #fff;
            font-weight: 700;
            font-size: 24px;
            margin-bottom: 20px;
          }
          p {
            color: #fff;
            font-weight: 400;
            font-size: 16px;
            margin-bottom: 10px;
          }
          .feature-details {
            background-color: #fff;
            color: #333;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 16px;
          }
          .footer {
            font-size: 14px;
            color: #f7f7f7;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>ConnecterLife</h1>
          </div>
          <h2>${normalizedLanguage === 'pt' ? 'Nova Solicitação de Recurso' : normalizedLanguage === 'es' ? 'Nueva Solicitud de Funcionalidad' : 'New Feature Request'}</h2>
          <p>${normalizedLanguage === 'pt' ? 'Olá,' : normalizedLanguage === 'es' ? 'Hola,' : 'Hello,'}</p>
          <p>${normalizedLanguage === 'pt' ? 'Recebemos uma nova solicitação de recurso. Aqui estão os detalhes:' : normalizedLanguage === 'es' ? 'Hemos recibido una nueva solicitud de funcionalidad. Aquí están los detalles:' : 'We received a new feature request. Here are the details:'}</p>
          <div class="feature-details">
            <strong>${normalizedLanguage === 'pt' ? 'E-mail:' : normalizedLanguage === 'es' ? 'Correo electrónico:' : 'Email:'}</strong> ${email}<br>
            <strong>${normalizedLanguage === 'pt' ? 'Feature:' : normalizedLanguage === 'es' ? 'Funcionalidad:' : 'Feature:'}</strong> ${feature}<br>
            <strong>${normalizedLanguage === 'pt' ? 'Detalhes:' : normalizedLanguage === 'es' ? 'Detalles:' : 'Details:'}</strong> ${details}
          </div>
          <p class="footer">${normalizedLanguage === 'pt' ? 'Se você tiver alguma dúvida ou precisar de mais informações, não hesite em entrar em contato.' : normalizedLanguage === 'es' ? 'Si tiene alguna pregunta o necesita más información, no dude en ponerse en contacto.' : 'If you have any questions or need more information, please feel free to contact us.'}</p>
          <p class="footer">${normalizedLanguage === 'pt' ? 'Atenciosamente,<br>Equipe Connecter Life' : normalizedLanguage === 'es' ? 'Atentamente,<br>Equipo Connecter Life' : 'Best regards,<br>Connecter Life Team'}</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    // Enviar o e-mail para o destinatário
    await transporter.sendMail(mailOptions);

    // Salvar a solicitação no banco de dados
    const newRequest = new FeatureRequest({ email, feature, details, language: normalizedLanguage });
    await newRequest.save();

    // Enviar e-mail de agradecimento ao usuário
    await sendAcknowledgmentEmail(email, feature, normalizedLanguage);

    res.status(200).json({ message: 'E-mail enviado com sucesso e solicitação salva.' });
  } catch (error) {
    console.error('Erro ao enviar e-mail ou salvar solicitação:', error);
    res.status(500).json({ message: 'Erro ao enviar e-mail ou salvar solicitação.', error: error.message });
  }
};

// Função para enviar e-mail de agradecimento
const sendAcknowledgmentEmail = async (userEmail, feature, language) => {
  const acknowledgmentMailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: language === 'pt' ? 'Obrigado pela Sua Solicitação de Recurso!' : language === 'es' ? '¡Gracias por su Solicitud de Funcionalidad!' : 'Thank You for Your Feature Request!',
    html: `
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@100;400;500;600;700&display=swap');
          body {
            font-family: 'Raleway', sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
          }
          .container {
            max-width: 600px;
            margin: auto;
            padding: 20px;
            border-radius: 8px;
            background-color: #ea4f97;
            color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .logo {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo h1 {
            color: white;
            font-weight: 700;
            font-size: 36px;
            margin: 0;
          }
          h2 {
            color: #fff;
            font-weight: 700;
            font-size: 24px;
            margin-bottom: 20px;
          }
          p {
            color: #fff;
            font-weight: 400;
            font-size: 16px;
            margin-bottom: 10px;
          }
          .feature-details {
            background-color: #fff;
            color: #333;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 16px;
          }
          .footer {
            font-size: 14px;
            color: #f7f7f7;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>ConnecterLife</h1>
          </div>
          <h2>${language === 'pt' ? 'Obrigado pela sua Solicitação de Recurso!' : language === 'es' ? '¡Gracias por su Solicitud de Funcionalidad!' : 'Thank You for Your Feature Request!'}</h2>
          <p>${language === 'pt' ? 'Sua solicitação foi recebida com sucesso. Agradecemos seu feedback!' : language === 'es' ? '¡Hemos recibido su solicitud con éxito. ¡Gracias por su opinión!' : 'Your request has been received successfully. Thank you for your feedback!'}</p>
          <p class="footer">${language === 'pt' ? 'Se você tiver alguma dúvida, entre em contato conosco.' : language === 'es' ? 'Si tiene alguna pregunta, póngase en contacto con nosotros.' : 'If you have any questions, please contact us.'}</p>
          <p class="footer">${language === 'pt' ? 'Atenciosamente,<br>Equipe Connecter Life' : language === 'es' ? 'Atentamente,<br>Equipo Connecter Life' : 'Best regards,<br>Connecter Life Team'}</p>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(acknowledgmentMailOptions);
};

module.exports = { sendFeatureRequest };
