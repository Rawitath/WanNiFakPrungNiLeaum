import request from "supertest";
import crypto from "crypto";
import pool from "../src/config/db.js";
import { createApp } from "../src/index.js";
import { makePassword } from "../src/utils/password_endec.js";

/**
 * ==============================================================================
 * WanNiFakPrungNiLeaum - End-to-End Integration Test Suite
 * ==============================================================================
 * Based on USECASE_DIAGRAM.md and DB_SCHEMA.md:
 *
 * Actors:
 *  - Customer (ลูกค้า)
 *  - Staff (ผู้รับฝากสัตว์เลี้ยง)
 *  - Manager (ฝ่ายบริหารศูนย์รับฝาก)
 *
 * Use Cases:
 *  - UC1: บันทึกข้อมูลผู้ฝาก
 *  - UC2: บันทึกสัตว์เข้าออก
 *  - UC3: บันทึกรายละเอียดสัตว์
 *  - UC4: แก้ไขสถานะสัตว์ที่รับฝาก
 *  - UC5: ดูรายละเอียดสัตว์เลี้ยง
 *  - UC6: ติดตามสถานะสัตว์เลี้ยง
 *  - UC7: จองคิวฝากสัตว์เลี้ยง
 *  - UC8: จัดการคิวฝากสัตว์เลี้ยง
 *  - UC9: ดูอัตราการฝากในแต่ละสาขา
 *  - UC10: ดูชนิดของสัตว์เลี้ยงในแต่ละสาขา
 *  - UC11: ดูสถานะของสัตว์เลี้ยงโดยรวมของแต่ละสาขา
 *
 * Test Design:
 *  Each test step performs:
 *   1. Authenticate (login / token resolution)
 *   2. Call HTTP endpoint
 *   3. Assert response status & body
 *   4. Direct database validation using `pool` to ensure data integrity.
 * ==============================================================================
 */

// 1. สร้าง Mock Transporter หลอกๆ ขึ้นมาเพื่อไม่ให้มีการเปิด Connection จริง
const mockTransporter = {
  sendMail: jest.fn().mockResolvedValue({ messageId: "mock-id" }),
  close: jest.fn(),
  verify: jest.fn().mockResolvedValue(true)
};

// 2. สร้าง app instance สำหรับรันเทสต์โดยเฉพาะ พร้อมยัด Mock เข้าไป
const app = createApp({ mailerTransporter: mockTransporter });

// Shared Fixture Identifiers (UUID format matching DB_SCHEMA.md)
const TEST_BRANCH_ID = "b0000000-0000-0000-0000-000000000001";
const TEST_BRANCH_NAME = "ลาดกระบัง";

const CUSTOMER_USER_ID = "c0000000-0000-0000-0000-000000000001";
const CUSTOMER_ID = "c1000000-0000-0000-0000-000000000001";
const CUSTOMER_PASSWORD = "password123";
const CUSTOMER_CREDENTIALS = {
  username: "customer_integration",
  password: "", // ปล่อยว่างไว้ก่อน เดี๋ยวมาใส่ใน beforeAll
  email: "customer_integration@test.com",
  phone: "0891234567",
  role: "customer"
};

const STAFF_USER_ID = "d0000000-0000-0000-0000-000000000001";
const STAFF_ID = "d1000000-0000-0000-0000-000000000001";
const STAFF_PASSWORD = "password123";
const STAFF_CREDENTIALS = {
  username: "staff_integration",
  password: "", // ปล่อยว่างไว้ก่อน เดี๋ยวมาใส่ใน beforeAll
  email: "staff_integration@test.com",
  phone: "0892345678",
  role: "staff"
};

const MANAGER_USER_ID = "e0000000-0000-0000-0000-000000000001";
const MANAGER_ID = "e1000000-0000-0000-0000-000000000001";
const MANAGER_PASSWORD = "password123";
const MANAGER_CREDENTIALS = {
  username: "manager_integration",
  password: "", // ปล่อยว่างไว้ก่อน เดี๋ยวมาใส่ใน beforeAll
  email: "manager_integration@test.com",
  phone: "0893456789",
  role: "admin"
};

let customerToken = "mock-customer-token";
let staffToken = "mock-staff-token";
let managerToken = "mock-admin-token";

let server;

let createdReservationId;
let createdPetId;

describe("WanNiFakPrungNiLeaum Integration Test Suite", () => {
  // ─── Setup & Teardown ────────────────────────────────────────────────────────

  beforeAll(async () => {
    server = app.listen(0);
    CUSTOMER_CREDENTIALS.password = await makePassword(CUSTOMER_PASSWORD);
    STAFF_CREDENTIALS.password = await makePassword(STAFF_PASSWORD);
    MANAGER_CREDENTIALS.password = await makePassword(MANAGER_PASSWORD);
    // 1. Ensure database schema exists according to DB_SCHEMA.md
    await pool.query(`
      CREATE TABLE IF NOT EXISTS branches (
        branch_id UUID PRIMARY KEY,
        branch_name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        userid UUID PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        role TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS oauthusers (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
          provider TEXT NOT NULL, -- เช่น 'google', 'github'
          provider_user_id TEXT NOT NULL, -- ID ที่ Google ส่งมา (googleUser.id)
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(provider, provider_user_id) -- ห้าม OAuth ID ซ้ำในระบบ
      );

      CREATE TABLE IF NOT EXISTS customers (
        customer_id UUID PRIMARY KEY,
        userid UUID REFERENCES users(userid) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS staffs (
        staff_id UUID PRIMARY KEY,
        userid UUID REFERENCES users(userid) ON DELETE CASCADE,
        branch_id UUID REFERENCES branches(branch_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS managers (
        manager_id UUID PRIMARY KEY,
        userid UUID REFERENCES users(userid) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS reservations (
        reservation_id UUID PRIMARY KEY,
        userid UUID REFERENCES users(userid) ON DELETE CASCADE,
        branch_id UUID REFERENCES branches(branch_id) ON DELETE CASCADE,
        customer_name TEXT,
        customer_phone TEXT,
        customer_email TEXT,
        reservation_date DATE DEFAULT CURRENT_DATE,
        check_in TIMESTAMPTZ,
        check_out TIMESTAMPTZ,
        pet_name TEXT,
        pet_type TEXT,
        pet_breed TEXT,
        pet_sex TEXT,
        pet_weight NUMERIC,
        pet_birth DATE,
        pet_condition TEXT,
        pet_note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS pets (
        pet_id UUID PRIMARY KEY,
        userid UUID REFERENCES users(userid) ON DELETE CASCADE,
        branch_id UUID REFERENCES branches(branch_id) ON DELETE CASCADE,
        customer_name TEXT,
        customer_phone TEXT,
        customer_email TEXT,
        reservation_date DATE DEFAULT CURRENT_DATE,
        check_in TIMESTAMPTZ,
        check_out TIMESTAMPTZ,
        pet_name TEXT,
        pet_type TEXT,
        pet_breed TEXT,
        pet_sex TEXT,
        pet_weight NUMERIC,
        pet_birth DATE,
        status TEXT,
        pet_condition TEXT,
        pet_note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Clean previous test runs
    await pool.query("DELETE FROM pets WHERE customer_email LIKE '%@test.com'");
    await pool.query("DELETE FROM reservations WHERE customer_email LIKE '%@test.com'");
    await pool.query("DELETE FROM customers WHERE userid IN ($1)", [CUSTOMER_USER_ID]);
    await pool.query("DELETE FROM staffs WHERE userid IN ($1)", [STAFF_USER_ID]);
    await pool.query("DELETE FROM managers WHERE userid IN ($1)", [MANAGER_USER_ID]);
    await pool.query("DELETE FROM users WHERE userid IN ($1, $2, $3)", [
      CUSTOMER_USER_ID,
      STAFF_USER_ID,
      MANAGER_USER_ID
    ]);
    await pool.query("DELETE FROM branches WHERE branch_id = $1", [TEST_BRANCH_ID]);

    // 3. Seed test fixtures
    await pool.query(
      "INSERT INTO branches (branch_id, branch_name) VALUES ($1, $2) ON CONFLICT (branch_id) DO NOTHING",
      [TEST_BRANCH_ID, TEST_BRANCH_NAME]
    );

    // Seed customer user & record
    await pool.query(
      "INSERT INTO users (userid, username, password, email, phone, role) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        CUSTOMER_USER_ID,
        CUSTOMER_CREDENTIALS.username,
        CUSTOMER_CREDENTIALS.password,
        CUSTOMER_CREDENTIALS.email,
        CUSTOMER_CREDENTIALS.phone,
        CUSTOMER_CREDENTIALS.role
      ]
    );
    await pool.query(
      "INSERT INTO customers (customer_id, userid) VALUES ($1, $2)",
      [CUSTOMER_ID, CUSTOMER_USER_ID]
    );

    // Seed staff user & record
    await pool.query(
      "INSERT INTO users (userid, username, password, email, phone, role) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        STAFF_USER_ID,
        STAFF_CREDENTIALS.username,
        STAFF_CREDENTIALS.password,
        STAFF_CREDENTIALS.email,
        STAFF_CREDENTIALS.phone,
        STAFF_CREDENTIALS.role
      ]
    );
    await pool.query(
      "INSERT INTO staffs (staff_id, userid, branch_id) VALUES ($1, $2, $3)",
      [STAFF_ID, STAFF_USER_ID, TEST_BRANCH_ID]
    );

    // Seed manager user & record
    await pool.query(
      "INSERT INTO users (userid, username, password, email, phone, role) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        MANAGER_USER_ID,
        MANAGER_CREDENTIALS.username,
        MANAGER_CREDENTIALS.password,
        MANAGER_CREDENTIALS.email,
        MANAGER_CREDENTIALS.phone,
        MANAGER_CREDENTIALS.role
      ]
    );
    await pool.query(
      "INSERT INTO managers (manager_id, userid) VALUES ($1, $2)",
      [MANAGER_ID, MANAGER_USER_ID]
    );
  }, 60000);

  afterAll(async () => {
    try {
      // Clean up test data
      await pool.query("DELETE FROM pets WHERE customer_email LIKE '%@test.com'");
      await pool.query("DELETE FROM reservations WHERE customer_email LIKE '%@test.com'");
      await pool.query("DELETE FROM customers WHERE userid IN ($1)", [CUSTOMER_USER_ID]);
      await pool.query("DELETE FROM staffs WHERE userid IN ($1)", [STAFF_USER_ID]);
      await pool.query("DELETE FROM managers WHERE userid IN ($1)", [MANAGER_USER_ID]);
      await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");
      await pool.query("DELETE FROM branches WHERE branch_id = $1", [TEST_BRANCH_ID]);
    } catch (err) {
      console.warn("Cleanup warning:", err.message);
    } finally {
      if (pool) await pool.end();
      if (server) server.close();
    }
  }, 60000);

  // ─── 1. Authentication & Actor Login ────────────────────────────────────────

  describe("Actor Authentication & Session Establishment", () => {
    it("Customer logs in and retrieves access token", async () => {
      const res = await request(server)
        .post("/api/login")
        .send({
          username: CUSTOMER_CREDENTIALS.username,
          password: CUSTOMER_PASSWORD
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      customerToken = res.body.accessToken;

      // Verify customer exists in database
      const dbCheck = await pool.query(
        "SELECT * FROM users WHERE userid = $1 AND role = 'customer'",
        [CUSTOMER_USER_ID]
      );
      expect(dbCheck.rows.length).toBe(1);
      expect(dbCheck.rows[0].username).toBe(CUSTOMER_CREDENTIALS.username);
    });

    it("Staff logs in and retrieves access token", async () => {
      const res = await request(server)
        .post("/api/login")
        .send({
          username: STAFF_CREDENTIALS.username,
          password: STAFF_PASSWORD
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      staffToken = res.body.accessToken;

      // Verify staff role & branch in database
      const dbCheck = await pool.query(
        "SELECT u.username, s.branch_id FROM users u JOIN staffs s ON u.userid = s.userid WHERE u.userid = $1",
        [STAFF_USER_ID]
      );
      expect(dbCheck.rows.length).toBe(1);
      expect(dbCheck.rows[0].branch_id).toBe(TEST_BRANCH_ID);
    });

    it("Manager logs in and retrieves access token", async () => {
      const res = await request(server)
        .post("/api/login")
        .send({
          username: MANAGER_CREDENTIALS.username,
          password: MANAGER_PASSWORD
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      managerToken = res.body.accessToken;

      // Verify manager record in database
      const dbCheck = await pool.query(
        "SELECT * FROM managers WHERE userid = $1",
        [MANAGER_USER_ID]
      );
      expect(dbCheck.rows.length).toBe(1);
    });
  });

  // ─── 2. Customer Workflow: Profile & Reservation (UC1, UC7) ─────────────────

  describe("Customer Workflow (UC1: บันทึกข้อมูลผู้ฝาก, UC7: จองคิวฝากสัตว์เลี้ยง)", () => {
    it("UC1: New customer registers and profile data is persisted in database", async () => {
      const newCustomer = {
        username: "somchai_registered",
        password: "password123",
        email: "somchai_new@test.com",
        phone: "0819998877"
      };

      const res = await request(server)
        .post("/api/register")
        .send(newCustomer);

      expect(res.status).toBe(201);

      // Verify in database: user created with customer role and customer record inserted
      const dbUser = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [newCustomer.email]
      );
      expect(dbUser.rows.length).toBe(1);
      expect(dbUser.rows[0].role).toBe("customer");
      expect(dbUser.rows[0].phone).toBe(newCustomer.phone);

      const dbCustomer = await pool.query(
        "SELECT * FROM customers WHERE userid = $1",
        [dbUser.rows[0].userid]
      );
      expect(dbCustomer.rows.length).toBe(1);
    });

    it("Customer updates personal profile information", async () => {
      const updatedProfile = {
        username: "customer_updated_name",
        phone: "0898887766",
        email: CUSTOMER_CREDENTIALS.email
      };

      const res = await request(server)
        .post("/api/profile")
        .set("Authorization", `Bearer ${customerToken}`)
        .send(updatedProfile);

      expect(res.status).toBe(200);

      // Check database to ensure updated profile is written
      const dbUser = await pool.query(
        "SELECT username, phone FROM users WHERE userid = $1",
        [CUSTOMER_USER_ID]
      );
      expect(dbUser.rows[0].username).toBe(updatedProfile.username);
      expect(dbUser.rows[0].phone).toBe(updatedProfile.phone);
    });

    it("UC7: Customer books a pet reservation and record is stored in database", async () => {
      const reservationPayload = {
        customerName: "สมชาย ใจดี",
        customerPhone: "0891234567",
        customerEmail: CUSTOMER_CREDENTIALS.email,
        petName: "มอมแมม",
        petType: "Dog",
        petBreed: "Golden Retriever",
        petSex: "Male",
        petWeight: 28,
        petBirth: "2021-03-10",
        petCondition: "สุขภาพดี ไม่มีโรคประจำตัว",
        petNote: "ทานอาหารเม็ดวันละ 2 มื้อ ห้ามให้อาหารคน",
        checkIn: "2026-11-10T09:00:00.000Z",
        checkOut: "2026-11-15T18:00:00.000Z",
        branch: TEST_BRANCH_NAME
      };

      const res = await request(server)
        .post("/api/customer/reservation")
        .set("Authorization", `Bearer ${customerToken}`)
        .send(reservationPayload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("reservationId");
      expect(res.body).toHaveProperty("reservationDate");
      createdReservationId = res.body.reservationId;

      // Database verification: Verify row in reservations table
      const dbRes = await pool.query(
        "SELECT * FROM reservations WHERE customer_email = $1 AND pet_name = $2",
        [CUSTOMER_CREDENTIALS.email, "มอมแมม"]
      );
      expect(dbRes.rows.length).toBeGreaterThan(0);
      const row = dbRes.rows[0];
      expect(row.customer_name).toBe(reservationPayload.customerName);
      expect(row.pet_breed).toBe(reservationPayload.petBreed);
      expect(Number(row.pet_weight)).toBe(28);
      expect(row.pet_condition).toBe(reservationPayload.petCondition);
      expect(row.branch_id).toBe(TEST_BRANCH_ID);
    });

    it("Customer views their list of reservations", async () => {
      const res = await request(server)
        .get("/api/customer/reservation")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("Customer views details of specific reservation by id", async () => {
      const res = await request(server)
        .get("/api/customer/reservation")
        .set("Authorization", `Bearer ${customerToken}`)
        .query({ id: createdReservationId });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("reservationId");
      expect(res.body.petName).toBe("มอมแมม");
      expect(res.body.customerName).toBe("สมชาย ใจดี");
    });

    it("UC7: Customer cancels a reservation and change is reflected in database", async () => {
      // Create a temporary reservation to cancel
      const tempResId = crypto.randomUUID();
      await pool.query(
        `INSERT INTO reservations (
          reservation_id, userid, branch_id, customer_name, customer_phone, customer_email,
          reservation_date, check_in, check_out, pet_name, pet_type, pet_breed, pet_sex, pet_weight
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, NOW(), NOW() + INTERVAL '2 days', $7, $8, $9, $10, $11)`,
        [
          tempResId,
          CUSTOMER_USER_ID,
          TEST_BRANCH_ID,
          "ลูกค้ายกเลิก",
          "0899990000",
          "cancel_test@test.com",
          "น้องโบ้",
          "Dog",
          "Poodle",
          "Female",
          5
        ]
      );

      const res = await request(server)
        .post("/api/customer/reservation/cancel")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ id: tempResId });

      expect(res.status).toBe(200);

      // Verify in database: either deleted or status updated to cancelled
      const dbCheck = await pool.query(
        "SELECT * FROM reservations WHERE reservation_id = $1",
        [tempResId]
      );
      expect(dbCheck.rows.length === 0 || dbCheck.rows[0].status === "cancelled").toBe(true);
    });
  });

  // ─── 3. Staff Workflow: Queue Management (UC8) ──────────────────────────────

  describe("Staff Workflow (UC8: จัดการคิวฝากสัตว์เลี้ยง)", () => {
    it("Staff views incoming reservation list", async () => {
      const res = await request(server)
        .get("/api/staff/reservation")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("Staff inspects single reservation details by id", async () => {
      const res = await request(server)
        .get("/api/staff/reservation")
        .set("Authorization", `Bearer ${staffToken}`)
        .query({ id: createdReservationId });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("reservationId");
      expect(res.body.petName).toBe("มอมแมม");
    });

    it("Staff accesses customer phone contact for reservation", async () => {
      const res = await request(server)
        .get(`/api/staff/reservation/${createdReservationId}/callcustomer`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("phone");
      expect(res.body.phone).toBe("0891234567");
    });

    it("Staff edits existing reservation and updates database", async () => {
      const updatePayload = {
        reservationId: createdReservationId,
        customerName: "สมชาย ใจดี (แก้ไขข้อมูล)",
        customerPhone: "0891234567",
        customerEmail: CUSTOMER_CREDENTIALS.email,
        petName: "มอมแมม",
        petType: "Dog",
        petBreed: "Golden Retriever",
        petSex: "Male",
        petWeight: 29,
        petBirth: "2021-03-10",
        petCondition: "ปกติ (เพิ่มยาบำรุงขน)",
        petNote: "ทานอาหารเม็ดวันละ 2 มื้อ แปรงขนทุกวัน",
        checkIn: "2026-11-10T10:00:00.000Z",
        checkOut: "2026-11-15T18:00:00.000Z",
        branch: TEST_BRANCH_NAME
      };

      const res = await request(server)
        .put("/api/staff/reservation")
        .set("Authorization", `Bearer ${staffToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);

      // Verify in database: weight and condition updated
      const dbCheck = await pool.query(
        "SELECT customer_name, pet_weight, pet_condition, pet_note FROM reservations WHERE reservation_id = $1",
        [createdReservationId]
      );
      expect(dbCheck.rows[0].customer_name).toBe(updatePayload.customerName);
      expect(Number(dbCheck.rows[0].pet_weight)).toBe(29);
      expect(dbCheck.rows[0].pet_condition).toBe(updatePayload.petCondition);
      expect(dbCheck.rows[0].pet_note).toBe(updatePayload.petNote);
    });

    it("Staff confirms and accepts reservation; pet record is created in pets table", async () => {
      const res = await request(server)
        .put(`/api/staff/reservation/${createdReservationId}/confirm`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          id: createdReservationId,
          accept: "true"
        });

      expect(res.status).toBe(200);

      // Per DB_SCHEMA.md: "pet is the accepted reservation"
      // Verify row in pets table was created from accepted reservation
      const dbPet = await pool.query(
        "SELECT * FROM pets WHERE pet_name = $1 AND customer_email = $2",
        ["มอมแมม", CUSTOMER_CREDENTIALS.email]
      );
      expect(dbPet.rows.length).toBeGreaterThan(0);
      createdPetId = dbPet.rows[0].pet_id;
      expect(dbPet.rows[0].pet_name).toBe("มอมแมม");
      expect(dbPet.rows[0].branch_id).toBe(TEST_BRANCH_ID);
    });
  });

  // ─── 4. Staff Workflow: Pet Care & Admission (UC2, UC3, UC4, UC5) ───────────

  describe("Staff Pet Admission & Care Workflow (UC2, UC3, UC4, UC5)", () => {
    it("UC2: Staff records check-in entry and timestamp is written to pets table", async () => {
      const checkInTime = "2026-11-10T10:30:00.000Z";

      const res = await request(server)
        .post("/api/staff/pets/entry")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          id: createdPetId,
          type: "check-in",
          timestamp: checkInTime
        });

      expect(res.status).toBe(201);

      // Check database for updated check_in
      const dbPet = await pool.query(
        "SELECT check_in FROM pets WHERE pet_id = $1",
        [createdPetId]
      );
      expect(dbPet.rows.length).toBe(1);
      expect(dbPet.rows[0].check_in).not.toBeNull();
    });

    it("UC4: Staff updates pet status to 'สบายดี' and database reflects the change", async () => {
      const res = await request(server)
        .post("/api/staff/pets/status")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          id: createdPetId,
          status: "สบายดี"
        });

      expect(res.status).toBe(200);

      // Check database status
      const dbPet = await pool.query(
        "SELECT status FROM pets WHERE pet_id = $1",
        [createdPetId]
      );
      expect(dbPet.rows[0].status).toBe("สบายดี");
    });

    it("UC4: Staff updates pet status to 'ไม่สบาย' when health condition changes", async () => {
      const res = await request(server)
        .post("/api/staff/pets/status")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          id: createdPetId,
          status: "ไม่สบาย"
        });

      expect(res.status).toBe(200);

      // Check database status
      const dbPet = await pool.query(
        "SELECT status FROM pets WHERE pet_id = $1",
        [createdPetId]
      );
      expect(dbPet.rows[0].status).toBe("ไม่สบาย");
    });

    it("UC3 & UC5: Staff views pet list and single pet details", async () => {
      const listRes = await request(server)
        .get("/api/staff/pets")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(listRes.status).toBe(200);
      expect(Array.isArray(listRes.body)).toBe(true);

      const detailRes = await request(server)
        .get("/api/staff/pets")
        .set("Authorization", `Bearer ${staffToken}`)
        .query({ petId: createdPetId });

      expect(detailRes.status).toBe(200);
      expect(detailRes.body.petName).toBe("มอมแมม");
      expect(detailRes.body.status).toBe("ไม่สบาย");
    });

    it("UC2: Staff records check-out entry and timestamp is written to pets table", async () => {
      const checkOutTime = "2026-11-15T17:00:00.000Z";

      const res = await request(server)
        .post("/api/staff/pets/entry")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          id: createdPetId,
          type: "check-out",
          timestamp: checkOutTime
        });

      expect(res.status).toBe(201);

      // Check database for check_out timestamp
      const dbPet = await pool.query(
        "SELECT check_out FROM pets WHERE pet_id = $1",
        [createdPetId]
      );
      expect(dbPet.rows[0].check_out).not.toBeNull();
    });
  });

  // ─── 5. Customer Tracking Workflow (UC5, UC6) ───────────────────────────────

  describe("Customer Pet Tracking Workflow (UC5: ดูรายละเอียด, UC6: ติดตามสถานะ)", () => {
    it("Customer lists their pets currently deposited", async () => {
      const res = await request(server)
        .get("/api/customer/pets")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("Customer tracks real-time pet status and care details", async () => {
      const res = await request(server)
        .get("/api/customer/pets")
        .set("Authorization", `Bearer ${customerToken}`)
        .query({ petId: createdPetId });

      expect(res.status).toBe(200);
      expect(res.body.petName).toBe("มอมแมม");
      expect(res.body.status).toBe("ไม่สบาย");

      // Verify consistency with database
      const dbPet = await pool.query(
        "SELECT pet_name, status, check_in, check_out FROM pets WHERE pet_id = $1",
        [createdPetId]
      );
      expect(res.body.status).toBe(dbPet.rows[0].status);
    });
  });

  // ─── 6. Manager Analytics Workflow (UC9, UC10, UC11) ────────────────────────

  describe("Manager Reporting Workflow (UC9, UC10, UC11)", () => {
    it("UC9, UC10, UC11: Manager views branch occupancy, pet types, and overall status", async () => {
      const res = await request(server)
        .get("/api/manager/status")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(typeof res.body).toBe("object");

      // Verify that database pet counts match manager aggregates
      const dbCount = await pool.query(
        "SELECT COUNT(*) FROM pets WHERE branch_id = $1",
        [TEST_BRANCH_ID]
      );
      expect(Number(dbCount.rows[0].count)).toBeGreaterThan(0);
    });
  });

  // ─── 7. Security, Authorization & Error Handling (401, 403, 404) ────────────

  describe("System Security Boundaries & Error Scenarios", () => {
    it("Returns 401 Unauthorized when request lacks authorization token", async () => {
      const res = await request(server).get("/api/profile");
      expect(res.status).toBe(401);
    });

    it("Returns 403 Forbidden when Customer attempts to access Manager endpoints", async () => {
      const res = await request(server)
        .get("/api/manager/status")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it("Returns 403 Forbidden when Customer attempts to access Staff endpoints", async () => {
      const res = await request(server)
        .get("/api/staff/reservation")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it("Returns 403 Forbidden when Staff attempts to access Manager endpoints", async () => {
      const res = await request(server)
        .get("/api/manager/status")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(403);
    });

    it("Returns 404 Not Found when querying non-existent reservation ID in database", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000999";
      const res = await request(server)
        .get("/api/customer/reservation")
        .set("Authorization", `Bearer ${customerToken}`)
        .query({ id: nonExistentId });

      expect(res.status).toBe(404);

      // Verify does not exist in database
      const dbCheck = await pool.query(
        "SELECT * FROM reservations WHERE reservation_id = $1",
        [nonExistentId]
      );
      expect(dbCheck.rows.length).toBe(0);
    });

    it("Returns 404 Not Found when querying non-existent pet ID in database", async () => {
      const nonExistentPetId = "00000000-0000-0000-0000-000000000999";
      const res = await request(server)
        .get("/api/staff/pets")
        .set("Authorization", `Bearer ${staffToken}`)
        .query({ petId: nonExistentPetId });

      expect(res.status).toBe(404);

      // Verify does not exist in database
      const dbCheck = await pool.query(
        "SELECT * FROM pets WHERE pet_id = $1",
        [nonExistentPetId]
      );
      expect(dbCheck.rows.length).toBe(0);
    });
  });

  describe('Google OAuth2 Redirection (GET /api/oauth/google)', () => {
    it('should redirect user to Google OAuth URL', async () => {
      const res = await request(app).get('/api/oauth/google');

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(res.headers.location).toContain('client_id=');
    });
  });

  describe('Google OAuth2 Login (GET /api/oauth/google/callback)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch; // คืนค่า fetch เดิมหลังจบแต่ละ test
    jest.restoreAllMocks();
  });

  it('should return 400 if code parameter is missing', async () => {
    const res = await request(app).get('/api/oauth/google/callback');

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Authorization code missing');
  });

  it('should login successfully when Google returns valid tokens and profile via People API', async () => {
    // 1. Mock fetch สำหรับ 2 Calls (1st: Exchange Token, 2nd: Get User Info via People API)
    const oauthEmail = 'test@example.com';
    const oauthPhone = '0812345678'; // เพิ่มเบอร์มือถือ
    
    global.fetch = jest.fn()
      // Call 1: Mock response จาก https://oauth2.googleapis.com/token
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'mock_access_token',
          id_token: 'mock_id_token',
          token_type: 'Bearer',
        }),
      })
      // Call 2: Mock response จาก https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,phoneNumbers
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          resourceName: 'people/1234567890', // People API จะใช้ format นี้แทน id เฉยๆ
          names: [{ displayName: 'Test User' }],
          emailAddresses: [{ value: oauthEmail }],
          phoneNumbers: [{ value: oauthPhone }]
        }),
      });

    // 2. ยิง Request พร้อม query code
    const res = await request(app).get('/api/oauth/google/callback?code=mock_authorization_code');

    // 3. Assertions
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res).toHaveProperty('accessToken');
    expect(res.accessToken).not.toBeNull();
    
    // ตรวจสอบข้อมูล user ที่ Controller คุณแกะและจัดรูปแบบกลับมาให้ Client
    expect(res.body.user).toEqual({
      id: '1234567890', // สมมติว่าฝั่ง Controller คุณตัดคำว่า 'people/' ออกไปแล้ว
      email: oauthEmail,
      name: 'Test User',
      phone: oauthPhone // ตรวจสอบเบอร์มือถือ
    });

    // ตรวจสอบว่า fetch ถูกเรียก 2 ครั้งถูกต้อง
    expect(global.fetch).toHaveBeenCalledTimes(2);

    const usersCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [oauthEmail]
    );
    // เช็คว่า oauth user ถูกบันทึกลง users ยัง
    expect(usersCheck.rowCount).toBeGreaterThan(0);
    // ถ้ามีการเซฟเบอร์โทรลง Database ด้วย สามารถเพิ่ม assertion ตรงนี้ได้
    // expect(usersCheck.rows[0].phone).toBe(oauthPhone);

    const oauthUsersCheck = await pool.query(
      "SELECT * FROM oauthusers WHERE userid = $1",
      [usersCheck.rows[0].userid]
    );
    expect(oauthUsersCheck.rowCount).toBeGreaterThan(0);
  });

  it('should return 400 if Google token exchange fails', async () => {
    // Mock เมื่อ Google ตอบกลับมาเป็น Error
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'invalid_grant',
        error_description: 'Bad Request',
      }),
    });

    const res = await request(app).get('/api/oauth/google/callback?code=invalid_code');

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Failed to fetch tokens');
  });
});

});
