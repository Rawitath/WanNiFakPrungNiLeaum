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

// ─── Profile ─────────────────────────────────────────────────────────────────

// Obtain a real token before running profile tests
let validToken;
beforeAll(async () => {
  const res = await request(app)
    .post("/api/login")
    .send({ username: "testuser", password: "password123" });
  validToken = res.body.accessToken;
});

describe("GET /api/profile", () => {
  it("should return the user's profile (name, phone, email)", async () => {
    const response = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("username");
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
      .set("Authorization", `Bearer ${validToken}`)
      .send({ username: "Updated Name", phone: "0899999999", email: "updated@test.com" });

    expect(response.status).toBe(200);
    //Check again
    const check = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${validToken}`);
    expect(check.body.username).toBe("Updated Name");
    expect(check.body.phone).toBe("0899999999");
    expect(check.body.email).toBe("updated@test.com");
  });
});

// ─── Manager ───────────────────────────────────────────────────────────────────

// Obtain role-specific tokens before running role-gated tests
let adminToken;
let customerToken;
let staffToken;
beforeAll(async () => {
  const adminRes = await request(app)
    .post("/api/login")
    .send({ username: "adminuser", password: "password123" });
  adminToken = adminRes.body.accessToken;

  const customerRes = await request(app)
    .post("/api/login")
    .send({ username: "customeruser", password: "password123" });
  customerToken = customerRes.body.accessToken;

  const staffRes = await request(app)
    .post("/api/login")
    .send({ username: "staffuser", password: "password123" });
  staffToken = staffRes.body.accessToken;
});

describe("GET /api/manager/status", () => {
  it("should return pet status grouped by branch and species", async () => {
    const response = await request(app)
      .get("/api/manager/status")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("branches");
    expect(Array.isArray(response.body.branches)).toBe(true);
    expect(response.body.branches[0]).toHaveProperty("branch");
    expect(response.body.branches[0]).toHaveProperty("pets");
    expect(Array.isArray(response.body.branches[0].pets)).toBe(true);
    expect(response.body.branches[0].pets[0]).toHaveProperty("species");
    expect(response.body.branches[0].pets[0]).toHaveProperty("status");
  });

  it("should return 403 when caller is not an admin", async () => {
    const response = await request(app)
      .get("/api/manager/status")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.status).toBe(403);
  });
});

// ─── Customer ────────────────────────────────────────────────────────────────

describe("GET /api/customer/reservation", () => {
  it("should return the customer's reservation list", async () => {
    const response = await request(app)
      .get("/api/customer/reservation")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe("GET /api/customer/reservation/:reservationId", () => {
  it("should return the customer's reservation by id", async () => {
    const response = await request(app)
      .get("/api/customer/reservation/1")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("reservationId");
    expect(response.body).toHaveProperty("branch");
    expect(response.body).toHaveProperty("customerName");
    expect(response.body).toHaveProperty("customerPhone");
    expect(response.body).toHaveProperty("customerEmail");
    expect(response.body).toHaveProperty("petName");
    expect(response.body).toHaveProperty("petType");
    expect(response.body).toHaveProperty("petSpecies");
    expect(response.body).toHaveProperty("petSex");
    expect(response.body).toHaveProperty("petWeight");
    expect(response.body).toHaveProperty("petBirth");
    expect(response.body).toHaveProperty("petCondition");
    expect(response.body).toHaveProperty("petNote");
    expect(response.body).toHaveProperty("reservationDate");
    expect(response.body).toHaveProperty("checkIn");
    expect(response.body).toHaveProperty("checkOut");
  });
});

describe("POST /api/customer/reservation", () => {
  it("should create a new reservation and return 201", async () => {
    const response = await request(app)
      .post("/api/customer/reservation")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        customerName: "John Doe",
        customerPhone: "0890123456",
        customerEmail: "test@example.com",
        petName: "สุทธิชัย",
        petType: "Dog",
        petSpecies: "Golden Retriever",
        petSex: "Male",
        petWeight: 25,
        petBirth: "2020-05-15",
        petCondition: "หอบหืด",
        petNote: "อย่าให้คึกเยอะ",
        checkIn: "2026-11-10T19:13:00.000Z",
        checkOut: "2026-11-15T20:00:00.000Z",
        branch: "ลาดกระบัง"
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("reservationId");
    expect(response.body).toHaveProperty("reservationDate");
  });
});

describe("POST /api/customer/reservation/cancel", () => {
  it("should cancel a reservation and return 200", async () => {
    const response = await request(app)
      .post("/api/customer/reservation/cancel")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ reservationId: 1 });

    expect(response.status).toBe(200);
  });

  it("should return 404 when reservation does not exist", async () => {
    const response = await request(app)
      .post("/api/customer/reservation/cancel")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ reservationId: 99999 });

    expect(response.status).toBe(404);
  });
});

// ─── Staff ───────────────────────────────────────────────────────────────────

describe("GET /api/staff/reservation", () => {
  it("should return reservation list with customer info, pet info, and check-in/out dates", async () => {
    const response = await request(app)
      .get("/api/staff/reservation")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe("GET /api/staff/reservation/:reservationId", () => {
  it("should return the customer's reservation by id", async () => {
    const response = await request(app)
      .get("/api/staff/reservation/1")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("reservationId");
    expect(response.body).toHaveProperty("branch");
    expect(response.body).toHaveProperty("customerName");
    expect(response.body).toHaveProperty("customerPhone");
    expect(response.body).toHaveProperty("customerEmail");
    expect(response.body).toHaveProperty("petName");
    expect(response.body).toHaveProperty("petType");
    expect(response.body).toHaveProperty("petSpecies");
    expect(response.body).toHaveProperty("petSex");
    expect(response.body).toHaveProperty("petWeight");
    expect(response.body).toHaveProperty("petBirth");
    expect(response.body).toHaveProperty("petCondition");
    expect(response.body).toHaveProperty("petNote");
    expect(response.body).toHaveProperty("reservationDate");
    expect(response.body).toHaveProperty("checkIn");
    expect(response.body).toHaveProperty("checkOut");
  });
});

describe("POST /api/staff/reservation", () => {
  it("should allow staff to create a reservation on behalf of a customer", async () => {
    const response = await request(app)
      .post("/api/staff/reservation")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        customerName: "John Doe",
        customerPhone: "0890123456",
        customerEmail: "test@example.com",
        petName: "สุทธิชัย",
        petType: "Dog",
        petSpecies: "Golden Retriever",
        petSex: "Male",
        petWeight: 25,
        petBirth: "2020-05-15",
        petCondition: "หอบหืด",
        petNote: "อย่าให้คึกเยอะ",
        checkIn: "2026-11-10T19:13:00.000Z",
        checkOut: "2026-11-15T20:00:00.000Z",
        branch: "ลาดกระบัง"
      });

    expect(response.status).toBe(201);
  });
  it("should allow staff to edit the existing a reservation", async () => {
    const response = await request(app)
      .put("/api/staff/reservation/1")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        customerName: "John Doe",
        customerPhone: "0890123456",
        customerEmail: "test@example.com",
        petName: "สุทธิชัย",
        petType: "Dog",
        petSpecies: "Golden Retriever",
        petSex: "Male",
        petWeight: 25,
        petBirth: "2020-05-15",
        petCondition: "หอบหืด",
        petNote: "อย่าให้คึกเยอะ",
        checkIn: "2026-11-10T19:13:00.000Z",
        checkOut: "2026-11-15T20:00:00.000Z",
        branch: "ลาดกระบัง"
      });

    expect(response.status).toBe(200);
  });
});

describe("GET /api/staff/pets", () => {
  it("should return all pets with customer info, customer ID, and check-in/out dates", async () => {
    const response = await request(app)
      .get("/api/staff/pets")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

// Have potential but not yet
// describe("GET /api/staff/pets/detail", () => {
//   it("should return detailed info for a specific pet", async () => {
//     const response = await request(app)
//       .get("/api/staff/pets/detail")
//       .query({ petId: 1 })
//       .set("Authorization", "Bearer <staff-token>");

//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty("petId");
//   });
// });

// describe("POST /api/staff/pets/detail", () => {
//   it("should update pet detail and return 200", async () => {
//     const response = await request(app)
//       .post("/api/staff/pets/detail")
//       .set("Authorization", "Bearer <staff-token>")
//       .send({ petId: 1, note: "กินข้าวเยอะ", health: "ปกติ" });

//     expect(response.status).toBe(200);
//   });
// });

describe("GET /api/staff/callcustomer", () => {
  it("should return the customer's phone number", async () => {
    const response = await request(app)
      .get("/api/staff/callcustomer")
      .query({ customerId: 1 })
      .set("Authorization", `Bearer ${staffToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("phone");
  });
});

describe("POST /api/staff/status", () => {
  it("should update pet status to 'checked-in' (ฝาก)", async () => {
    const response = await request(app)
      .post("/api/staff/status")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ petId: 1, status: "checked-in" });

    expect(response.status).toBe(200);
  });

  it("should update pet status to 'checked-out' (รับกลับ)", async () => {
    const response = await request(app)
      .post("/api/staff/status")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ petId: 1, status: "checked-out" });

    expect(response.status).toBe(200);
  });
});

describe("POST /api/staff/pets/entry", () => {
  it("should record a pet check-in entry and return 201", async () => {
    const response = await request(app)
      .post("/api/staff/pets/entry")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ petId: 1, type: "check-in", timestamp: "2026-11-10T09:00:00Z" });

    expect(response.status).toBe(201);
  });

  it("should record a pet check-out entry and return 201", async () => {
    const response = await request(app)
      .post("/api/staff/pets/entry")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ petId: 1, type: "check-out", timestamp: "2026-11-15T17:00:00Z" });

    expect(response.status).toBe(201);
  });
});
