import request from "supertest";
import app from "../src/index.js";

// ─── Auth ───────────────────────────────────────────────────────────────────

describe("POST /api/login", () => {
  it("should return a JWT token when username credentials are valid", async () => {
    const response = await request(app)
      .post("/api/login")
      .send({ username: "testuser", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should return a JWT token when email credentials are valid", async () => {
    const response = await request(app)
      .post("/api/login")
      .send({ username: "test@example.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
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

  it("should return 409 when username or email already exists", async () => {
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

  it("should return 404 when email is not found", async () => {
    const response = await request(app)
      .post("/api/forget")
      .send({ email: "nobody@test.com" });

    expect(response.status).toBe(404);
  });
});

describe("POST /api/oauth", () => {
  it("should return a JWT token when OAuth token is valid", async () => {
    const response = await request(app)
      .post("/api/oauth")
      .send({ provider: "google", token: "valid-oauth-token" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });
});

// ─── Profile ─────────────────────────────────────────────────────────────────

describe("GET /api/profile", () => {
  it("should return the user's profile (name, phone, email)", async () => {
    const response = await request(app)
      .get("/api/profile")
      .set("Authorization", "Bearer <valid-token>");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("phone");
    expect(response.body).toHaveProperty("email");
  });

  it("should return 401 when not authenticated", async () => {
    const response = await request(app).get("/api/profile");
    expect(response.status).toBe(401);
  });
});

describe("POST /api/profile", () => {
  it("should update the user's profile and return 200", async () => {
    const response = await request(app)
      .post("/api/profile")
      .set("Authorization", "Bearer <valid-token>")
      .send({ name: "Updated Name", phone: "0899999999", email: "updated@test.com" });

    expect(response.status).toBe(200);
  });
});

// ─── Admin ───────────────────────────────────────────────────────────────────

describe("GET /api/manager/status", () => {
  it("should return pet status grouped by branch and species", async () => {
    const response = await request(app)
      .get("/api/manager/status")
      .set("Authorization", "Bearer <admin-token>");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("branches");
    // each branch should have a list of pets grouped by species
    // e.g. { branches: [{ name: "ลาดกระบัง", pets: { dog: [...], cat: [...] } }] }
  });

  it("should return 403 when caller is not an admin", async () => {
    const response = await request(app)
      .get("/api/manager/status")
      .set("Authorization", "Bearer <customer-token>");

    expect(response.status).toBe(403);
  });
});

// ─── Customer ────────────────────────────────────────────────────────────────

describe("GET /api/customer/detail", () => {
  it("should return pet detail (species, age, weight, status, etc.)", async () => {
    const response = await request(app)
      .get("/api/customer/detail")
      .set("Authorization", "Bearer <customer-token>");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("species");
    expect(response.body).toHaveProperty("age");
    expect(response.body).toHaveProperty("weight");
    expect(response.body).toHaveProperty("status");
  });
});

describe("GET /api/customer/reservation", () => {
  it("should return the customer's reservation list", async () => {
    const response = await request(app)
      .get("/api/customer/reservation")
      .set("Authorization", "Bearer <customer-token>");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe("POST /api/customer/reservation", () => {
  it("should create a new reservation and return 201", async () => {
    const response = await request(app)
      .post("/api/customer/reservation")
      .set("Authorization", "Bearer <customer-token>")
      .send({ petId: 1, checkIn: "2026-11-10", checkOut: "2026-11-15", branch: "ลาดกระบัง" });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("reservationId");
  });
});

describe("POST /api/customer/reservation/cancel", () => {
  it("should cancel a reservation and return 200", async () => {
    const response = await request(app)
      .post("/api/customer/reservation/cancel")
      .set("Authorization", "Bearer <customer-token>")
      .send({ reservationId: 1 });

    expect(response.status).toBe(200);
  });

  it("should return 404 when reservation does not exist", async () => {
    const response = await request(app)
      .post("/api/customer/reservation/cancel")
      .set("Authorization", "Bearer <customer-token>")
      .send({ reservationId: 99999 });

    expect(response.status).toBe(404);
  });
});

// ─── Staff ───────────────────────────────────────────────────────────────────

describe("GET /api/staff/reservation", () => {
  it("should return reservation list with customer info, pet info, and check-in/out dates", async () => {
    const response = await request(app)
      .get("/api/staff/reservation")
      .set("Authorization", "Bearer <staff-token>");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe("POST /api/staff/reservation", () => {
  it("should allow staff to create a reservation on behalf of a customer", async () => {
    const response = await request(app)
      .post("/api/staff/reservation")
      .set("Authorization", "Bearer <staff-token>")
      .send({ customerId: 1, petId: 1, checkIn: "2026-11-10", checkOut: "2026-11-15" });

    expect(response.status).toBe(201);
  });
});

describe("GET /api/staff/pets", () => {
  it("should return all pets with customer info, customer ID, and check-in/out dates", async () => {
    const response = await request(app)
      .get("/api/staff/pets")
      .set("Authorization", "Bearer <staff-token>");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe("GET /api/staff/pets/detail", () => {
  it("should return detailed info for a specific pet", async () => {
    const response = await request(app)
      .get("/api/staff/pets/detail")
      .query({ petId: 1 })
      .set("Authorization", "Bearer <staff-token>");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("petId");
  });
});

describe("POST /api/staff/pets/detail", () => {
  it("should update pet detail and return 200", async () => {
    const response = await request(app)
      .post("/api/staff/pets/detail")
      .set("Authorization", "Bearer <staff-token>")
      .send({ petId: 1, note: "กินข้าวเยอะ", health: "ปกติ" });

    expect(response.status).toBe(200);
  });
});

describe("GET /api/staff/callcustomer", () => {
  it("should return the customer's phone number", async () => {
    const response = await request(app)
      .get("/api/staff/callcustomer")
      .query({ customerId: 1 })
      .set("Authorization", "Bearer <staff-token>");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("phone");
  });
});

describe("POST /api/staff/status", () => {
  it("should update pet status to 'checked-in' (ฝาก)", async () => {
    const response = await request(app)
      .post("/api/staff/status")
      .set("Authorization", "Bearer <staff-token>")
      .send({ petId: 1, status: "checked-in" });

    expect(response.status).toBe(200);
  });

  it("should update pet status to 'checked-out' (รับกลับ)", async () => {
    const response = await request(app)
      .post("/api/staff/status")
      .set("Authorization", "Bearer <staff-token>")
      .send({ petId: 1, status: "checked-out" });

    expect(response.status).toBe(200);
  });
});

describe("POST /api/staff/pets/entry", () => {
  it("should record a pet check-in entry and return 201", async () => {
    const response = await request(app)
      .post("/api/staff/pets/entry")
      .set("Authorization", "Bearer <staff-token>")
      .send({ petId: 1, type: "check-in", timestamp: "2026-11-10T09:00:00Z" });

    expect(response.status).toBe(201);
  });

  it("should record a pet check-out entry and return 201", async () => {
    const response = await request(app)
      .post("/api/staff/pets/entry")
      .set("Authorization", "Bearer <staff-token>")
      .send({ petId: 1, type: "check-out", timestamp: "2026-11-15T17:00:00Z" });

    expect(response.status).toBe(201);
  });
});
