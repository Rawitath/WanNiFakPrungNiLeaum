import request from "supertest";
import app from "../src/index.js";
// ─── Auth ───────────────────────────────────────────────────────────────────

describe("POST /api/login", () => {
  it("should return a JWT token when username credentials are valid", async () => {
    const response = await request(app)
      .post("/api/login")
      .send({ username: "testuser", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
  });

  it("should return a JWT token when email credentials are valid", async () => {
    const response = await request(app)
      .post("/api/login")
      .send({ username: "test@example.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
  });

  it("should return 401 when credentials are invalid", async () => {
    const response = await request(app)
      .post("/api/login")
      .send({ username: "testuser", password: "wrongpassword" });

    expect(response.status).toBe(401);
  });
});

describe("POST /api/register", () => {
  it("should register a new user and return 201", async () => {
    const response = await request(app)
      .post("/api/register")
      .send({ username: "newuser", password: "password123", email: "new@test.com", phone: "0812345678" });

    expect(response.status).toBe(201);
  });

  it("should return 409 when username already exists", async () => {
    const response = await request(app)
      .post("/api/register")
      .send({ username: "existinguser", password: "password123", email: "existing@test.com", phone: "0812345678" });

    expect(response.status).toBe(409);
  });

  it("should return 409 when email already exists", async () => {
    const response = await request(app)
      .post("/api/register")
      .send({ username: "existinguser", password: "password123", email: "existing@test.com", phone: "0812345678" });

    expect(response.status).toBe(409);
  });
});

describe("POST /api/forget", () => {
  it("should send a password reset link when email exists", async () => {
    const response = await request(app)
      .post("/api/forget")
      .send({ email: "existing@test.com" });

    expect(response.status).toBe(200);
  });

  it("should also return 200 when email is not found", async () => {
    const response = await request(app)
      .post("/api/forget")
      .send({ email: "nobody@test.com" });

    expect(response.status).toBe(200);
  });
});

describe("POST /api/forget/reset", () => {
  it("should return 200 when password reset is successful", async () => {
    const response = await request(app)
      .post("/api/forget/reset")
      .send({ token: "<reset-token>", password: "newpassword123" });

    expect(response.status).toBe(200);
  });

  it("should return 400 when reset token is invalid or expired", async () => {
    const response = await request(app)
      .post("/api/forget/reset")
      .send({ token: "invalid-token", password: "newpassword123" });

    expect(response.status).toBe(400);
  });
});

// describe("POST /api/oauth", () => {
//   it("should return a JWT token when OAuth token is valid", async () => {
//     const response = await request(app)
//       .post("/api/oauth")
//       .send({ provider: "google", token: "valid-oauth-token" });

//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty("accessToken");
//   });
// });