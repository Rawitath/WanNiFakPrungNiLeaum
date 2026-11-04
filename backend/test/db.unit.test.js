import pool from "../src/config/db"

describe("db", () => {
  it("should connect to the database", async () => {
    const res = await pool.query("SELECT 1");
    expect(res.rows.length).toBe(1);
  }
)
})