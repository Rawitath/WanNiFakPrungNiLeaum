import express from 'express';
import defaultAuthMiddleware from './auth/authentication.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc'
import register from './auth/register.js';
import login from './auth/login.js';
import { createForgetHandlers } from './auth/forget.js';

export function createApp(options = {}) {
  //-----------------------------Auth Middleware---------------------------------
  let currentAuthMiddleware = typeof options === 'function'
    ? options
    : (options?.authMiddleware || defaultAuthMiddleware);

  //-----------------------------Forget Handlers---------------------------------
  // Allow a custom nodemailer transporter to be injected for testing (DI).
  // Pass options.mailerTransporter to use a custom SMTP transporter (e.g. Ethereal).
  const { requestForget, checkForget, resetPassword } = createForgetHandlers(
    options?.mailerTransporter || null
  );

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
          url: `http://localhost:${process.env.PORT || 3000}`,
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
 *     summary: Request a password reset link
 *     description: >
 *       Accepts a username or email address. Sends a password reset e-mail
 *       with a link containing a short-lived JWT `resetToken`.
 *       Always returns 200 regardless of whether the account exists (security by design).
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
 *                 description: Username or e-mail address of the account
 *                 example: testuser
 *     responses:
 *       200:
 *         description: Request acknowledged (always returned, even if account not found)
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
 *     summary: Validate a password reset token
 *     description: >
 *       Checks whether the provided `resetToken` query parameter is a valid,
 *       non-expired JWT issued for a password reset. Returns 200 if valid,
 *       401 if invalid or expired.
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: resetToken
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT reset token (received via e-mail link)
 *         example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reset token is valid
 *       401:
 *         description: Token is missing, invalid, or expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired reset token
 *   post:
 *     summary: Reset password using a valid reset token
 *     description: >
 *       Verifies the `resetToken` and updates the user's password.
 *       Returns 200 on success, 400 if fields are missing, 401 if the token is invalid/expired.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - password
 *             properties:
 *               resetToken:
 *                 type: string
 *                 description: JWT reset token received via e-mail link
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               password:
 *                 type: string
 *                 description: New password to set
 *                 example: newSecurePassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successfully
 *       400:
 *         description: Missing resetToken or password in request body
 *       401:
 *         description: Token is invalid or expired
 */
app.get('/api/forget/reset', checkForget);

app.post('/api/forget/reset', resetPassword);

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
