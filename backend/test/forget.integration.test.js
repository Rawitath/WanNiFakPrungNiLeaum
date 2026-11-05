/**
 * ==============================================================================
 * Forget Password – Integration Test Suite
 * ==============================================================================
 * Tests the full forget-password flow:
 *   POST /api/forget          → requestForget  (always 200)
 *   GET  /api/forget/reset    → checkForget    (200 valid / 401 invalid)
 *   POST /api/forget/reset    → resetPassword  (200 success / 401 bad token)
 *
 * Nodemailer is injected via createApp({ mailerTransporter }) using an
 * Ethereal (smtp.ethereal.email) test account so no real e-mail is sent.
 * ==============================================================================
 */

import request from "supertest";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { createApp } from "../src/index.js";
import pool from "../src/config/db.js";
import { makePassword } from "../src/utils/password_endec.js";

// ---------------------------------------------------------------------------
// Test fixture
// ---------------------------------------------------------------------------
const TEST_USER = {
  userid: "f0000000-0000-0000-0000-000000000001",
  username: "forget_test_user",
  email: "forget_test@ethereal.example",
  phone: "0890000001",
  role: "customer",
  password: "OldPassword123",
};

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a valid reset JWT (default 15 m expiry). */
function makeResetToken(overrides = {}, expiresIn = "15m") {
  return jwt.sign(
    {
      userid: TEST_USER.userid,
      username: TEST_USER.username,
      purpose: "password_reset",
      ...overrides,
    },
    JWT_SECRET,
    { expiresIn }
  );
}

/** Build an already-expired reset JWT. */
function makeExpiredToken() {
  return makeResetToken({}, "-1s");
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe("Forget Password Flow (Ethereal SMTP)", () => {
  let app;
  let etherealTransporter;
  let sentMails = [];

  // ---- DB fixture setup ----------------------------------------------------
  beforeAll(async () => {
    // 1. Create an Ethereal test account (free, ephemeral, no real delivery)
    const account = await nodemailer.createTestAccount();

    etherealTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });

    // Spy on sendMail to capture sent messages without network round-trips in
    // the assertions (the preview URL is enough to confirm delivery).
    const originalSendMail = etherealTransporter.sendMail.bind(etherealTransporter);
    etherealTransporter.sendMail = async (mailOptions) => {
      const info = await originalSendMail(mailOptions);
      sentMails.push({ mailOptions, info });
      return info;
    };

    // 2. Build the app with the injected transporter
    app = createApp({ mailerTransporter: etherealTransporter });

    // 3. Insert the test user into the database
    const hashedPassword = await makePassword(TEST_USER.password, TEST_USER.username);
    await pool.query(
      `INSERT INTO users (userid, username, password, email, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (userid) DO UPDATE
         SET username = EXCLUDED.username,
             password = EXCLUDED.password,
             email    = EXCLUDED.email`,
      [
        TEST_USER.userid,
        TEST_USER.username,
        hashedPassword,
        TEST_USER.email,
        TEST_USER.phone,
        TEST_USER.role,
      ]
    );
  });

  afterAll(async () => {
    // Clean up test user
    await pool.query("DELETE FROM users WHERE userid = $1", [TEST_USER.userid]);
    await pool.end();
  });

  beforeEach(() => {
    sentMails = [];
  });

  // ==========================================================================
  // POST /api/forget  – requestForget
  // ==========================================================================

  describe("POST /api/forget", () => {
    it("returns 200 and sends an e-mail when username matches", async () => {
      const res = await request(app)
        .post("/api/forget")
        .send({ username: TEST_USER.username });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Password reset requested");

      // One mail must have been sent to the correct address
      expect(sentMails).toHaveLength(1);
      expect(sentMails[0].mailOptions.to).toBe(TEST_USER.email);

      // The mail body must contain a resetToken query param
      const mailBody =
        sentMails[0].mailOptions.text || sentMails[0].mailOptions.html || "";
      expect(mailBody).toMatch(/resetToken=/);

      // Ethereal preview URL (useful when debugging)
      console.log(
        "Ethereal preview (username lookup):",
        nodemailer.getTestMessageUrl(sentMails[0].info)
      );
    });

    it("returns 200 and sends an e-mail when email matches", async () => {
      const res = await request(app)
        .post("/api/forget")
        .send({ username: TEST_USER.email });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Password reset requested");

      expect(sentMails).toHaveLength(1);
      expect(sentMails[0].mailOptions.to).toBe(TEST_USER.email);

      console.log(
        "Ethereal preview (email lookup):",
        nodemailer.getTestMessageUrl(sentMails[0].info)
      );
    });

    it("returns 200 even when username/email does NOT exist (no e-mail sent)", async () => {
      const res = await request(app)
        .post("/api/forget")
        .send({ username: "nonexistent_user_xyz" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Password reset requested");

      // No mail should have been dispatched
      expect(sentMails).toHaveLength(0);
    });

    it("returns 200 even when username field is missing", async () => {
      const res = await request(app).post("/api/forget").send({});

      expect(res.status).toBe(200);
      expect(sentMails).toHaveLength(0);
    });

    it("the reset link contains a valid JWT with purpose=password_reset", async () => {
      await request(app)
        .post("/api/forget")
        .send({ username: TEST_USER.username });

      expect(sentMails).toHaveLength(1);

      const mailText = sentMails[0].mailOptions.text;
      const tokenMatch = mailText.match(/resetToken=([^\s\n]+)/);
      expect(tokenMatch).not.toBeNull();

      const token = tokenMatch[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      expect(decoded.purpose).toBe("password_reset");
      expect(decoded.userid).toBe(TEST_USER.userid);
      expect(decoded.username).toBe(TEST_USER.username);
    });
  });

  // ==========================================================================
  // GET /api/forget/reset  – checkForget
  // ==========================================================================

  describe("GET /api/forget/reset", () => {
    it("returns 200 for a valid reset token", async () => {
      const token = makeResetToken();
      const res = await request(app)
        .get("/api/forget/reset")
        .query({ resetToken: token });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Reset token is valid");
    });

    it("returns 401 for an expired token", async () => {
      const token = makeExpiredToken();
      const res = await request(app)
        .get("/api/forget/reset")
        .query({ resetToken: token });

      expect(res.status).toBe(401);
    });

    it("returns 401 for a completely invalid token string", async () => {
      const res = await request(app)
        .get("/api/forget/reset")
        .query({ resetToken: "this.is.not.a.jwt" });

      expect(res.status).toBe(401);
    });

    it("returns 401 when resetToken query param is missing", async () => {
      const res = await request(app).get("/api/forget/reset");

      expect(res.status).toBe(401);
    });

    it("returns 401 for a valid JWT that lacks purpose=password_reset", async () => {
      // e.g. an ordinary access token signed with the same secret
      const wrongToken = jwt.sign(
        { userid: TEST_USER.userid, role: "customer" },
        JWT_SECRET,
        { expiresIn: "15m" }
      );
      const res = await request(app)
        .get("/api/forget/reset")
        .query({ resetToken: wrongToken });

      expect(res.status).toBe(401);
    });
  });

  // ==========================================================================
  // POST /api/forget/reset  – resetPassword
  // ==========================================================================

  describe("POST /api/forget/reset", () => {
    it("returns 200 and updates the password in the DB for a valid token", async () => {
      const newPassword = "NewSecurePassword456";
      const token = makeResetToken();

      const res = await request(app)
        .post("/api/forget/reset")
        .send({ resetToken: token, password: newPassword });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Password reset successfully");

      // Verify the new password works by attempting a login
      const loginRes = await request(app)
        .post("/api/login")
        .send({ username: TEST_USER.username, password: newPassword });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body).toHaveProperty("accessToken");
    });

    it("returns 401 for an expired reset token", async () => {
      const token = makeExpiredToken();
      const res = await request(app)
        .post("/api/forget/reset")
        .send({ resetToken: token, password: "AnyPassword123" });

      expect(res.status).toBe(401);
    });

    it("returns 401 for an invalid reset token", async () => {
      const res = await request(app)
        .post("/api/forget/reset")
        .send({ resetToken: "bad.token.here", password: "AnyPassword123" });

      expect(res.status).toBe(401);
    });

    it("returns 401 for a JWT without purpose=password_reset", async () => {
      const wrongToken = jwt.sign(
        { userid: TEST_USER.userid, role: "customer" },
        JWT_SECRET,
        { expiresIn: "15m" }
      );
      const res = await request(app)
        .post("/api/forget/reset")
        .send({ resetToken: wrongToken, password: "AnyPassword123" });

      expect(res.status).toBe(401);
    });

    it("returns 400 when resetToken is missing from body", async () => {
      const res = await request(app)
        .post("/api/forget/reset")
        .send({ password: "AnyPassword123" });

      expect(res.status).toBe(400);
    });

    it("returns 400 when password is missing from body", async () => {
      const token = makeResetToken();
      const res = await request(app)
        .post("/api/forget/reset")
        .send({ resetToken: token });

      expect(res.status).toBe(400);
    });
  });
});
