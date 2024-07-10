const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const transporter = require("../config/mailer");
const crypto = require("crypto");
const schedule = require("node-schedule");
const express = require("express");

// Função para registrar usuário

exports.registerUser = async (req, res) => {
  try {
    const {
      username,
      email,
      phone,
      password,
      confirmPassword,
      firstName,
      lastName,
      dob,
      gender,
    } = req.body;

    // Verifica se o usuário, email ou telefone já existem no banco
    const existingUser = await User.findOne({
      $or: [{ username }, { email }, { phone }],
    });

    if (existingUser) {
      const errors = {};

      if (existingUser.username === username) {
        errors.username = "Nome de usuário já em uso.";
      }

      if (existingUser.email === email) {
        errors.email = "Endereço de email já em uso.";
      }

      if (existingUser.phone === phone) {
        errors.phone = "Número de telefone já em uso.";
      }

      return res.status(400).json({
        success: false,
        errors,
        message: "Falha ao registrar usuário.",
      });
    }

    // Verifica se a senha e a confirmação de senha coincidem
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, error: "As senhas não coincidem." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      email,
      phone,
      firstName,
      lastName,
      dob,
      gender,
      biography: "", // Você pode inicializar a biografia como uma string vazia
    });

    await user.save();

    // Resposta do backend atualizada para retornar sucesso
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Erro interno ao registrar usuário." });
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verifica se o email e a senha foram fornecidos
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email e senha são campos obrigatórios." });
    }

    // Busca o usuário ignorando maiúsculas/minúsculas no email
    const user = await User.findOne({
      email: { $regex: new RegExp("^" + email.toLowerCase(), "i") },
    });

    if (!user) {
      return res
        .status(401)
        .json({ error: "Credenciais inválidas. Email não encontrado." });
    }

    // Verifica se a senha é correta
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "Credenciais inválidas. Senha incorreta." });
    }
    // Verifica se há uma solicitação de exclusão pendente e cancela
    if (user.deletionRequestedAt) {
      user.deletionRequestedAt = null;
      await user.save();
    }
    // Gera o token de autenticação
    const token = jwt.sign({ userId: user._id }, "seuSegredoDoToken");

    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    console.error("Erro durante o login:", error);
    res.status(500).json({
      error: "Erro interno ao fazer login. Tente novamente mais tarde.",
    });
  }
};

exports.checkFieldAvailability = async (req, res) => {
  try {
    const { fieldName, value } = req.body;

    // Define os campos que requerem verificação de disponibilidade
    const fieldsToCheck = ["username", "email", "phone"];

    // Verifica se o campo fornecido requer verificação
    if (!fieldsToCheck.includes(fieldName)) {
      return res.status(400).json({
        error: "Campo não suportado para verificação de disponibilidade.",
      });
    }

    // Verifica se já existe um usuário com o valor fornecido no campo específico
    const existingUser = await User.findOne({ [fieldName]: value });

    // Retorna se o campo está disponível ou não
    res.json({ available: !existingUser });
  } catch (error) {
    console.error(
      `Erro ao verificar a disponibilidade de ${fieldName}:`,
      error
    );
    res.status(500).json({ available: false }); // Em caso de erro, considerar como não disponível
  }
};

// Função para buscar e retornar o nome de usuário pelo ID
exports.getUsernameById = async (req, res) => {
  const { userId } = req.params; // Obtém o userId dos parâmetros da solicitação

  try {
    // Busca o usuário no banco de dados pelo ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Verifica se há uma solicitação de exclusão pendente
    if (user.deletionRequestedAt) {
      return res.status(404).json({ error: "Perfil não disponível" });
    }

    // Retorna o nome de usuário
    res.json({ username: user.username });
  } catch (error) {
    console.error("Erro ao buscar nome de usuário:", error);
    res.status(500).json({ error: "Erro interno ao buscar nome de usuário." });
  }
};

const languageMapping = {
  'en-US': 'en',
  'pt-BR': 'pt',
  'es-ES': 'es',
  // Adicione outras mapeações conforme necessário
};

exports.requestPasswordReset = async (req, res) => {
  const { email, language = 'en-US' } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6-digit verification code

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    user.verificationCode = verificationCode; // Save verification code to the user
    await user.save();

    const normalizedLanguage = languageMapping[language] || language;
    const validLanguages = ['en', 'pt', 'es'];
    if (!validLanguages.includes(normalizedLanguage)) {
      return res.status(400).json({ error: 'Invalid language.' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: normalizedLanguage === 'pt' ? 'Código de Verificação para Redefinição de Senha' : 
               normalizedLanguage === 'es' ? 'Código de Verificación para Restablecimiento de Contraseña' : 
               'Password Reset Verification Code',
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
            background-color: ${normalizedLanguage === 'pt' ? '#f70073' : 
                                normalizedLanguage === 'es' ? '#f70073' : 
                                '#ea4f97'};
          }
          h2 {
            color: #000;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
            font-weight: 700;
            font-size: 24px;
          }
          p {
            color: #fff;
            font-weight: 700;
            font-size: 16px;
          }
          .verification-code {
            background-color: #fff;
            padding: 10px;
            border-radius: 5px;
            color: #333;
            text-align: center;
            font-weight: 700;
            font-size: 24px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${normalizedLanguage === 'pt' ? 'Redefinição de Senha' : 
                 normalizedLanguage === 'es' ? 'Restablecimiento de Contraseña' : 
                 'Password Reset'}</h2>
          <p>${normalizedLanguage === 'pt' ? 'Olá,' : 
                 normalizedLanguage === 'es' ? 'Hola,' : 
                 'Hello,'}</p>
          <p>${normalizedLanguage === 'pt' ? 'Você solicitou uma redefinição de senha. Seu código de verificação é:' : 
                 normalizedLanguage === 'es' ? 'Ha solicitado un restablecimiento de contraseña. Su código de verificación es:' : 
                 'You requested a password reset. Your verification code is:'}</p>
          <h3 class="verification-code">
            ${verificationCode}
          </h3>
          <p>${normalizedLanguage === 'pt' ? 'Se você não solicitou esta alteração, por favor, ignore este e-mail.' : 
                 normalizedLanguage === 'es' ? 'Si no solicitó este cambio, por favor ignore este correo electrónico.' : 
                 'If you did not request this change, please ignore this email.'}</p>
          <p>${normalizedLanguage === 'pt' ? 'Atenciosamente,<br>Equipe Connecter Life' : 
                 normalizedLanguage === 'es' ? 'Atentamente,<br>Equipo Connecter Life' : 
                 'Best regards,<br>Connecter Life Team'}</p>
        </div>
      </body>
      </html>
    `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: normalizedLanguage === 'pt' ? 'Código de verificação enviado com sucesso.' : 
               normalizedLanguage === 'es' ? 'Código de verificación enviado con éxito.' : 
               'Verification code sent successfully.',
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({
      error: 'Internal error requesting password reset.',
    });
  }
};

exports.verifyResetCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    // Verifica se o e-mail foi fornecido na solicitação
    if (!email) {
      return res.status(400).json({ error: "O e-mail é obrigatório." });
    }

    // Verifica se o código foi fornecido na solicitação
    if (!code) {
      return res.status(400).json({ error: "O código é obrigatório." });
    }

    // Busca o usuário pelo e-mail fornecido
    const user = await User.findOne({ email });

    // Verifica se o usuário foi encontrado
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Verifica se o código de verificação corresponde ao do usuário
    if (user.verificationCode !== code) {
      return res.status(400).json({ error: "Código de verificação inválido." });
    }

    // Se tudo estiver correto, retorna sucesso
    res.json({ success: true, message: "Código de verificação válido." });
  } catch (error) {
    console.error("Erro ao verificar o código de redefinição de senha:", error);
    res.status(500).json({
      error: "Erro interno ao verificar o código de redefinição de senha.",
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Redefinir a senha e limpar o token de redefinição e a data de expiração
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ success: true, message: "Senha redefinida com sucesso." });
  } catch (error) {
    console.error("Erro ao redefinir a senha:", error);
    res.status(500).json({ error: "Erro interno ao redefinir a senha." });
  }
};

exports.getUserLanguage = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json({ language: user.language });
  } catch (error) {
    console.error("Erro ao buscar preferência de idioma:", error);
    res
      .status(500)
      .json({ error: "Erro interno ao buscar preferência de idioma." });
  }
};

exports.updateUserLanguage = async (req, res) => {
  const { userId, language } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    user.language = language;
    await user.save();

    res.json({
      success: true,
      message: "Preferência de idioma atualizada com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao atualizar preferência de idioma:", error);
    res
      .status(500)
      .json({ error: "Erro interno ao atualizar preferência de idioma." });
  }
};

// Função para solicitar a exclusão de conta
exports.requestAccountDeletion = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Define a data da solicitação de exclusão para a data e hora atual
    user.deletionRequestedAt = new Date();
    await user.save();

    // Agenda a exclusão da conta após 30 dias
    const deletionDate = new Date(
      user.deletionRequestedAt.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    // Aqui, agende a exclusão da conta usando a biblioteca apropriada, como agenda de tarefas ou eventos no banco de dados

    res.json({
      success: true,
      message:
        "Solicitação de exclusão de conta realizada com sucesso. A conta será deletada após 30 dias.",
    });
  } catch (error) {
    console.error("Erro ao solicitar exclusão de conta:", error);
    res
      .status(500)
      .json({ error: "Erro interno ao solicitar exclusão de conta." });
  }
};
