import express from 'express';
import defaultAuthMiddleware from './auth/authentication.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc'
import registerCustomer from './auth/register.js';
import profileRouter from './all/profile.js';
import login from './auth/login.js';
import detailRouter from './customer/detail.js';
import reservationRouter from './customer/reservation.js';
import cancelRouter from './customer/cancel.js';
import statusRouter from './manager/status.js';
import reservStaffRouter from './staff/reservstaff.js';
import petsRouter from './all/pets.js';
import petsDetailRouter from './staff/petsdetail.js';
import callCustomerRouter from './staff/callcustomer.js';
import statusStaffRouter from './staff/statusstaff.js';
import entryRouter from './staff/entry.js';
import { createForgetHandlers } from './auth/forget.js';
import { googleOauth, googleOauthCallback } from './auth/oauth.js';

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
    const publicPaths = ['/login', '/register', '/forget', '/docs', '/oauth'];
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
app.post('/api/register', registerCustomer);

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

/**
 * @openapi
 * /api/oauth/google:
 *   get:
 *     summary: Redirects to Google OAuth 2.0 Login Page
 *     description: Redirects the user to Google's consent screen to initiate OAuth login process.
 *     tags:
 *       - Authentication
 *     responses:
 *       302:
 *         description: Redirects user to Google OAuth consent page (`https://accounts.google.com/o/oauth2/v2/auth`).
 */
app.get('/api/oauth/google', googleOauth);

/**
 * @openapi
 * /api/oauth/google/callback:
 *   get:
 *     summary: Handles Google OAuth 2.0 Callback
 *     description: Receives the authorization code from Google, exchanges it for tokens, retrieves user profile, and authenticates the user.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code returned by Google OAuth server after user approval.
 *         example: 4/0AVG7fiq...
 *     responses:
 *       200:
 *         description: Successfully authenticated with Google.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "109876543210987654321"
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     verified_email:
 *                       type: boolean
 *                       example: true
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     given_name:
 *                       type: string
 *                       example: John
 *                     family_name:
 *                       type: string
 *                       example: Doe
 *                     picture:
 *                       type: string
 *                       example: https://lh3.googleusercontent.com/a/default-user
 *       400:
 *         description: Missing authorization code or Google token exchange failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Authorization code missing
 *                 details:
 *                   type: object
 *       500:
 *         description: Internal server error during authentication flow.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
app.get('/api/oauth/google/callback', googleOauthCallback);

  //เขียน Endpoint ในนี้นะ
  // Mount profile router
  app.use('/api', profileRouter);
  // Mount status router (admin)
  app.use('/api', statusRouter);
  // Mount detail router
  app.use('/api', detailRouter);
  // Mount reservation router
  app.use('/api', reservationRouter);
  // Mount cancel router
  app.use('/api', cancelRouter);
  // Mount pets router (customer & staff)
  app.use('/api', petsRouter);
  // Mount staff reservation router
  app.use('/api', reservStaffRouter);
  // Mount staff pets detail router
  app.use('/api', petsDetailRouter);
  // Mount call customer router
  app.use('/api', callCustomerRouter);
  // Mount staff status router
  app.use('/api', statusStaffRouter);
  // Mount entry router
  app.use('/api', entryRouter);

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
