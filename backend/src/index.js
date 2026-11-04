import express from 'express';
import defaultAuthMiddleware from './auth/authentication.js';

export function createApp(options = {}) {
  let currentAuthMiddleware = typeof options === 'function'
    ? options
    : (options?.authMiddleware || defaultAuthMiddleware);

  const app = express();
  app.use(express.json());

  app.setAuthMiddleware = (middleware) => {
    currentAuthMiddleware = middleware;
  };
  app.injectAuthMiddleware = (middleware) => {
    currentAuthMiddleware = middleware;
  };

  const authMiddleware = (req, res, next) => {
    if (typeof currentAuthMiddleware === 'function') {
      return currentAuthMiddleware(req, res, next);
    }
    next();
  };

  app.authMiddleware = authMiddleware;

  // Protect /api routes except public auth endpoints
  app.use('/api', (req, res, next) => {
    const publicPaths = ['/login', '/register', '/forget'];
    if (publicPaths.some(p => req.path.startsWith(p))) {
      return next();
    }
    return authMiddleware(req, res, next);
  });

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  //เขียน Endpoint ในนี้นะ

  return app;
}

const app = createApp();
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`WanniFakPrungNiLeaum listening on port ${port}`);
  });
}

export default app;
