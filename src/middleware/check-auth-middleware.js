const jwt = require('jsonwebtoken');

exports.checkAuthMiddleware = (request, response, next) => {
  const { authorization } = request.headers;
  
  if (!authorization) {
    return response
      .status(401)
      .json({ error: true, code: 'token.invalid', message: 'Token not present.' })
  }

  const [, token] = authorization?.split(' ');

  if (!token) {
    return response 
      .status(401)
      .json({ error: true, code: 'token.invalid', message: 'Token not present.' })
  }

  try {
    const decoded = jwt.verify(token, 'seuSegredoDoToken');

    request.user = decoded;

    return next();
  } catch (err) {
    return response 
      .status(401)
      .json({  error: true, code: 'token.expired', message: 'Token invalid.' })
  }
}