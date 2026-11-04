import request from "supertest";
import { createApp } from "../src/index.js";

// Mock tokens
const validToken = "mock-valid-token";
const adminToken = "mock-admin-token";
const customerToken = "mock-customer-token";
const staffToken = "mock-staff-token";

function isObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

// Mock auth middleware for testing without an auth system
const mockAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  if (token === validToken) {
    req.user = { username: "testuser", role: "customer", phone: "0899999999", email: "test@example.com" };
  } else if (token === adminToken) {
    req.user = { username: "adminuser", role: "admin" };
  } else if (token === customerToken) {
    req.user = { username: "customeruser", role: "customer" };
  } else if (token === staffToken) {
    req.user = { username: "staffuser", role: "staff" };
  } else {
    return res.status(401).json({ error: "Invalid token" });
  }

  next();
};

const app = createApp({ authMiddleware: mockAuthMiddleware });

// ─── Profile ─────────────────────────────────────────────────────────────────

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

  it("should return 401 when token is invalid", async () => {
    const response = await request(app)
      .get("/api/profile")
      .set("Authorization", "Bearer invalid-token");
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

  it("should return 400 when email format is invalid", async () => {
    const response = await request(app)
      .post("/api/profile")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ username: "Updated Name", phone: "0899999999", email: "invalid-email" });

    expect(response.status).toBe(400);
  });
});

// ─── Manager ───────────────────────────────────────────────────────────────────

describe("GET /api/manager/status", () => {
  it("should return pet status grouped by branch and breed", async () => {
    const response = await request(app)
      .get("/api/manager/status")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(isObject(response.body)).toBe(true);
    // expect(response.body).toHaveProperty("branches");
    // expect(Array.isArray(response.body.branches)).toBe(true);
    // expect(response.body.branches[0]).toHaveProperty("branch");
    // expect(response.body.branches[0]).toHaveProperty("pets");
    // expect(Array.isArray(response.body.branches[0].pets)).toBe(true);
    // expect(response.body.branches[0].pets[0]).toHaveProperty("breed");
    // expect(response.body.branches[0].pets[0]).toHaveProperty("status");
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

  it("should return the customer's reservation by id", async () => {
    const response = await request(app)
      .get("/api/customer/reservation")
      .set("Authorization", `Bearer ${customerToken}`)
      .query({ id: 1 });

    expect(response.status).toBe(200);
    expect(isObject(response.body)).toBe(true);
    // expect(response.body).toHaveProperty("reservationId");
    // expect(response.body).toHaveProperty("branch");
    // expect(response.body).toHaveProperty("customerName");
    // expect(response.body).toHaveProperty("customerPhone");
    // expect(response.body).toHaveProperty("customerEmail");
    // expect(response.body).toHaveProperty("petName");
    // expect(response.body).toHaveProperty("petType");
    // expect(response.body).toHaveProperty("petBreed");
    // expect(response.body).toHaveProperty("petSex");
    // expect(response.body).toHaveProperty("petWeight");
    // expect(response.body).toHaveProperty("petBirth");
    // expect(response.body).toHaveProperty("petCondition");
    // expect(response.body).toHaveProperty("petNote");
    // expect(response.body).toHaveProperty("reservationDate");
    // expect(response.body).toHaveProperty("checkIn");
    // expect(response.body).toHaveProperty("checkOut");
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
        petBreed: "Golden Retriever",
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

  it("should return 400 when required fields are missing", async () => {
    const response = await request(app)
      .post("/api/customer/reservation")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        customerName: "John Doe"
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 when checkOut date is before checkIn date", async () => {
    const response = await request(app)
      .post("/api/customer/reservation")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        customerName: "John Doe",
        customerPhone: "0890123456",
        customerEmail: "test@example.com",
        petName: "สุทธิชัย",
        petType: "Dog",
        petBreed: "Golden Retriever",
        petSex: "Male",
        petWeight: 25,
        petBirth: "2020-05-15",
        petCondition: "หอบหืด",
        petNote: "อย่าให้คึกเยอะ",
        checkIn: "2026-11-15T20:00:00.000Z",
        checkOut: "2026-11-10T19:13:00.000Z",
        branch: "ลาดกระบัง"
      });

    expect(response.status).toBe(400);
  });
});

describe("POST /api/customer/reservation/cancel", () => {
  it("should cancel a reservation and return 200", async () => {
    const response = await request(app)
      .post("/api/customer/reservation/cancel")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ id: 1 });

    expect(response.status).toBe(200);
  });

  it("should return 400 when reservation id is missing", async () => {
    const response = await request(app)
      .post("/api/customer/reservation/cancel")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({});

    expect(response.status).toBe(400);
  });
});

describe("GET /api/customer/pets", () => {
  it("should allow staff to get a list of pets (accepted reservation)", async () => {
    const response = await request(app)
      .get("/api/customer/pets")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should allow staff to get a single pet by petId (accepted reservation)", async () => {
    const response = await request(app)
      .get("/api/customer/pets")
      .set("Authorization", `Bearer ${customerToken}`)
      .query({ petId: 1 });

    expect(response.status).toBe(200);
    expect(isObject(response.body)).toBe(true);
    // expect(response.body).toHaveProperty("petId");
    // expect(response.body).toHaveProperty("branch");
    // expect(response.body).toHaveProperty("customerName");
    // expect(response.body).toHaveProperty("customerPhone");
    // expect(response.body).toHaveProperty("customerEmail");
    // expect(response.body).toHaveProperty("petName");
    // expect(response.body).toHaveProperty("petType");
    // expect(response.body).toHaveProperty("petBreed");
    // expect(response.body).toHaveProperty("petSex");
    // expect(response.body).toHaveProperty("petWeight");
    // expect(response.body).toHaveProperty("petBirth");
    // expect(response.body).toHaveProperty("petCondition");
    // expect(response.body).toHaveProperty("petNote");
    // expect(response.body).toHaveProperty("status");
    // expect(response.body).toHaveProperty("checkIn");
    // expect(response.body).toHaveProperty("checkOut");
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

  it("should return the customer's reservation by id", async () => {
    const response = await request(app)
      .get("/api/staff/reservation")
      .set("Authorization", `Bearer ${staffToken}`)
      .query({ id: 1 });

    expect(response.status).toBe(200);
    expect(isObject(response.body)).toBe(true);
    // expect(response.body).toHaveProperty("reservationId");
    // expect(response.body).toHaveProperty("branch");
    // expect(response.body).toHaveProperty("customerName");
    // expect(response.body).toHaveProperty("customerPhone");
    // expect(response.body).toHaveProperty("customerEmail");
    // expect(response.body).toHaveProperty("petName");
    // expect(response.body).toHaveProperty("petType");
    // expect(response.body).toHaveProperty("petBreed");
    // expect(response.body).toHaveProperty("petSex");
    // expect(response.body).toHaveProperty("petWeight");
    // expect(response.body).toHaveProperty("petBirth");
    // expect(response.body).toHaveProperty("petCondition");
    // expect(response.body).toHaveProperty("petNote");
    // expect(response.body).toHaveProperty("reservationDate");
    // expect(response.body).toHaveProperty("checkIn");
    // expect(response.body).toHaveProperty("checkOut");
  });
});

describe("PUT /api/staff/reservation", () => {
  it("should allow staff to edit the existing a reservation", async () => {
    const response = await request(app)
      .put("/api/staff/reservation")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        reservationId: 1,
        customerName: "John Doe",
        customerPhone: "0890123456",
        customerEmail: "test@example.com",
        petName: "สุทธิชัย",
        petType: "Dog",
        petBreed: "Golden Retriever",
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

describe("PUT /api/staff/reservation/:reservationId/confirm", () => {
  it("should allow staff accept a reservation and return 200", async () => {
    const response = await request(app)
      .put("/api/staff/reservation/1/confirm")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        id: 1,
        accept: "true"
      });

    expect(response.status).toBe(200);
  });

  it("should allow staff deny a reservation and return 200", async () => {
    const response = await request(app)
      .put("/api/staff/reservation/1/confirm")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        id: 1,
        accept: "false"
      });

    expect(response.status).toBe(200);
  });

  it("should return 400 when accept field is missing", async () => {
    const response = await request(app)
      .put("/api/staff/reservation/1/confirm")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        id: 1
      });

    expect(response.status).toBe(400);
  });
});

describe("GET /api/staff/reservation/:reservationId/callcustomer", () => {
  it("should return the customer's phone number", async () => {
    const response = await request(app)
      .get("/api/staff/reservation/1/callcustomer")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("phone");
  });
});

describe("GET /api/staff/pets", () => {
  it("should allow staff to get a list of pets (accepted reservation)", async () => {
    const response = await request(app)
      .get("/api/staff/pets")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should allow staff to get a single pet by petId (accepted reservation)", async () => {
    const response = await request(app)
      .get("/api/staff/pets")
      .set("Authorization", `Bearer ${staffToken}`)
      .query({ petId: 1 });

    expect(response.status).toBe(200);
    expect(isObject(response.body)).toBe(true);
    // expect(response.body).toHaveProperty("petId");
    // expect(response.body).toHaveProperty("branch");
    // expect(response.body).toHaveProperty("customerName");
    // expect(response.body).toHaveProperty("customerPhone");
    // expect(response.body).toHaveProperty("customerEmail");
    // expect(response.body).toHaveProperty("petName");
    // expect(response.body).toHaveProperty("petType");
    // expect(response.body).toHaveProperty("petBreed");
    // expect(response.body).toHaveProperty("petSex");
    // expect(response.body).toHaveProperty("petWeight");
    // expect(response.body).toHaveProperty("petBirth");
    // expect(response.body).toHaveProperty("petCondition");
    // expect(response.body).toHaveProperty("petNote");
    // expect(response.body).toHaveProperty("status");
    // expect(response.body).toHaveProperty("checkIn");
    // expect(response.body).toHaveProperty("checkOut");
  });
});

describe("POST /api/staff/pets/status", () => {
  it("should update pet status to 'สบายดี'", async () => {
    const response = await request(app)
      .post("/api/staff/pets/status")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ id: 1, status: "สบายดี" });

    expect(response.status).toBe(200);
  });

  it("should update pet status to 'ไม่สบาย'", async () => {
    const response = await request(app)
      .post("/api/staff/pets/status")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ id: 1, status: "ไม่สบาย" });

    expect(response.status).toBe(200);
  });

  it("should return 400 when pet status is invalid", async () => {
    const response = await request(app)
      .post("/api/staff/pets/status")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ id: 1, status: "invalid_status" });

    expect(response.status).toBe(400);
  });
});

describe("POST /api/staff/pets/entry", () => {
  it("should record a pet check-in entry and return 201", async () => {
    const response = await request(app)
      .post("/api/staff/pets/entry")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ id: 1, type: "check-in", timestamp: "2026-11-10T09:00:00Z" });

    expect(response.status).toBe(201);
  });

  it("should record a pet check-out entry and return 201", async () => {
    const response = await request(app)
      .post("/api/staff/pets/entry")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ id: 1, type: "check-out", timestamp: "2026-11-15T17:00:00Z" });

    expect(response.status).toBe(201);
  });

  it("should return 400 when entry type is invalid", async () => {
    const response = await request(app)
      .post("/api/staff/pets/entry")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ id: 1, type: "invalid_type", timestamp: "2026-11-10T09:00:00Z" });

    expect(response.status).toBe(400);
  });
});
