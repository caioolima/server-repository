// app.js (ou server.js)

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const communityRoutes = require('./src/routes/communityRoutes'); // Importe as rotas das comunidades
const routes = require('./src/routes');
const galleryRoutes = require('./src/routes/galleryRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const feedRoutes = require('./src/routes/feedRoutes');

// Configuração do CORS
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3001;

// Lista de origens permitidas (ou '*' para permitir qualquer origem)
const allowedOrigins = ['http://localhost:3000', 'https://connecter-life.vercel.app'];

// Configuração do CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Verifica se a origem da requisição está na lista de origens permitidas
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'PUT'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos (adicionando 'Authorization')
};
app.use(cors(corsOptions));

// Conectar-se ao banco de dados MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Conexão com o banco de dados estabelecida com sucesso!");
    // Iniciar o servidor após a conexão ser estabelecida
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar-se ao banco de dados:", error);
  });
app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/profile', profileRoutes);
app.use('/communities', communityRoutes); // Use as rotas das comunidades
app.use('/message', messageRoutes);
app.use('/gallery', galleryRoutes);
app.use('/feedRoutes', feedRoutes)
app.use(routes);
