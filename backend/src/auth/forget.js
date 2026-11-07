import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { makePassword } from "../utils/password_endec.js";
import db from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

// ---------------------------------------------------------------------------
// Mailer Factory (Dependency-Injectable)
// ---------------------------------------------------------------------------
// Default transporter uses env vars so it works in production.
// Tests can inject their own transporter (e.g. Ethereal) via createForgetHandlers().

function createDefaultTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ---------------------------------------------------------------------------
// Handler Factory – accepts an optional pre-built transporter for DI / testing
// ---------------------------------------------------------------------------

export function createForgetHandlers(transporter = null) {
  // Lazily build the default transporter only when handlers are actually called,
  // so test environments can skip env-var SMTP config entirely.
  const getTransporter = () => transporter || createDefaultTransporter();

  /**
   * POST /api/forget
   * Accepts { username } – can be a username OR an e-mail address.
   * Always responds 200 (never reveals whether the account exists).
   */
  const requestForget = async (req, res, next) => {
    try {
      const { username } = req.body;

      if (!username) {
        return res.status(200).json({ message: "Password reset requested" });
      }

      // Look up by username OR email
      const result = await db.query(
        "SELECT userid, username, email FROM users WHERE username = $1 OR email = $1",
        [username]
      );

      // Always return 200 – do not leak whether the account exists
      if (result.rows.length === 0) {
        return res.status(200).json({ message: "Password reset requested" });
      }

      const user = result.rows[0];

      // Build a short-lived reset token (15 minutes)
      const resetToken = jwt.sign(
        { userid: user.userid, username: user.username, purpose: "password_reset" },
        process.env.JWT_SECRET || "secret_key",
        { expiresIn: "15m" }
      );

      const resetUrl = `${process.env.WEB_URL || "http://localhost:3000"}?resetToken=${resetToken}`;

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@example.com",
        to: user.email,
        subject: "Password Reset Request",
        text: `You requested a password reset. Click the link below to reset your password (valid for 15 minutes):\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
        html: `
          <p>You requested a password reset.</p>
          <p>Click the link below to reset your password (valid for 15 minutes):</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you did not request this, please ignore this email.</p>
        `,
      };

      await getTransporter().sendMail(mailOptions);

      return res.status(200).json({ message: "Password reset requested" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/forget/reset?resetToken=<token>
   * Validates the reset token without changing anything.
   * Returns 200 if valid, 401 if expired or invalid.
   */
  const checkForget = (req, res, next) => {
    try {
      const { resetToken } = req.query;

      if (!resetToken) {
        return res.status(401).json({ message: "Missing reset token" });
      }

      const decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET || "secret_key"
      );

      if (decoded.purpose !== "password_reset") {
        return res.status(401).json({ message: "Invalid reset token" });
      }

      return res.status(200).json({ message: "Reset token is valid" });
    } catch (error) {
      // JsonWebTokenError, TokenExpiredError → 401
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        return res.status(401).json({ message: "Invalid or expired reset token" });
      }
      next(error);
    }
  };

  /**
   * POST /api/forget/reset
   * Body: { resetToken, password }
   * Verifies the token then updates the user's password.
   */
  const resetPassword = async (req, res, next) => {
    try {
      const { resetToken, password } = req.body;

      if (!resetToken || !password) {
        return res.status(400).json({ message: "Missing resetToken or password" });
      }

      let decoded;
      try {
        decoded = jwt.verify(
          resetToken,
          process.env.JWT_SECRET || "secret_key"
        );
      } catch (err) {
        return res.status(401).json({ message: "Invalid or expired reset token" });
      }

      if (decoded.purpose !== "password_reset") {
        return res.status(401).json({ message: "Invalid reset token" });
      }

      // Hash the new password using the existing utility (salt derived from username)
      const hashedPassword = await makePassword(password, decoded.username);

      await db.query(
        "UPDATE users SET password = $1 WHERE userid = $2",
        [hashedPassword, decoded.userid]
      );

      return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      next(error);
    }
  };

  return { requestForget, checkForget, resetPassword };
}

// ---------------------------------------------------------------------------
// Default exports – use env-based transporter (production / dev)
// ---------------------------------------------------------------------------
const { requestForget, checkForget, resetPassword } = createForgetHandlers();

export { requestForget, checkForget, resetPassword };
