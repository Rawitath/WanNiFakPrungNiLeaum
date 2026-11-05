import express from 'express';
import defaultAuthMiddleware from './auth/authentication.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc'
import register from './auth/register.js';
import login from './auth/login.js';
import { requestForget } from './auth/forget.js';

export function createApp(options = {}) {
  //-----------------------------Auth Middleware---------------------------------
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

  //------------------------------------Swagger--------------------------------------
  // Swagger Options Definition
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'WanNiFakPrungNiLeaum (StayTodayForgetTomorrow) API Documentation',
        version: '0.0.1',
        description: '1',
      },
      servers: [
        {
          url: `http://localhost:${port}`,
          description: 'Development Server',
        },
      ],
    },
    apis: ['./src/index.js'], // ระบุไฟล์ที่มีการเขียน JSDoc annotations
  };

  const swaggerSpec = swaggerJsDoc(swaggerOptions);

  // Swagger Route
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  //---------------------------------------Endpoints-------------------------------------

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *               - phone
 *             properties:
 *               username:
 *                 type: string
 *                 example: newuser
 *               password:
 *                 type: string
 *                 example: password123
 *               email:
 *                 type: string
 *                 format: email
 *                 example: new@test.com
 *               phone:
 *                 type: string
 *                 example: "0812345678"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Username or email already exists
 */
app.post('/api/register', register);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login for user (supports both username and email)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Can be either username or email
 *                 example: testuser
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials
 */
app.post('/api/login', login);

/**
 * @swagger
 * /api/forget:
 *   post:
 *     summary: request for reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 description: Can be either username or email
 *                 example: testuser
 *     responses:
 *       200:
 *         description: Successfully sent request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset requested
 */
app.post('/api/forget', requestForget);

/**
 * @swagger
 * /api/forget/reset:
 *   get:
 *     summary: check if password reset token is valid
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 description: Can be either username or email
 *                 example: testuser
 *     responses:
 *       200:
 *         description: Successfully sent request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset requested
 *   post:
 *     summary: submit password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 description: Can be either username or email
 *                 example: testuser
 *     responses:
 *       200:
 *         description: Successfully sent request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset requested
 */
app.get('/api/forget/reset', (req, res) => {
    res.send('Hello World!');
  });

app.post('/api/forget/reset', (req, res) => {
  res.send('Hello World!');
});

  //เขียน Endpoint ในนี้นะ

  return app;
}
//---------------------------------------------Export App---------------------------------------
const app = createApp();
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`WanniFakPrungNiLeaum listening on port ${port}`);
  });
}

export default app;
