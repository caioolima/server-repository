const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const profileRoutes = require('./profileRoutes');
const relationRoutes = require('./relationRoutes');
const galleryRoutes = require('./galleryRoutes'); // Importando as rotas da galeria

const routes = [authRoutes, userRoutes, profileRoutes, relationRoutes, galleryRoutes]; // Adicionando as rotas da galeria ao array

module.exports = routes;
