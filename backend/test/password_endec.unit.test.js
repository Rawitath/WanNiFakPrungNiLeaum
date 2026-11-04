import {makePassword, checkPassword} from "../src/utils/password_endec";

describe("makePassword", () => {
  it("should return a hash of the password concatenated with the salt", async () => {
    const password = "testPassword";
    const salt = "randomSalt";
    const hash1 = await makePassword(password, salt);
    const hash2 = await makePassword(password, salt)
    expect(hash1).toBeInstanceOf(String);
    expect(hash1.length).toBeGreaterThan(0);
    expect(hash2).toBeInstanceOf(String);
    expect(hash2.length).toBeGreaterThan(0);
    expect(hash1).not.toBe(hash2);
  }
)
});

describe("checkPassword", () => {
  it("should return true when password is right", async () => {
    const password = "testPassword";
    const salt = "randomSalt";
    const hash1 = await makePassword(password, salt);
    const hash2 = await makePassword(password, salt)
    const result1 = await checkPassword(password, hash1);
    const result2 = await checkPassword(password, hash2);
    expect(result1).toBe(true);
    expect(hash1.length).toBeGreaterThan(0);
    expect(result2).toBe(true);
    expect(hash2.length).toBeGreaterThan(0);
  });
  it("should return false when password is wrong", async () => {
    const password = "testPassword";
    const wrongPassword = "dfashfewiojfe";
    const salt = "randomSalt";
    const hash1 = await makePassword(password, salt);
    const hash2 = await makePassword(password, salt)
    const result1 = await checkPassword(wrongPassword, hash1);
    const result2 = await checkPassword(wrongPassword, hash2);
    expect(result1).toBe(false);
    expect(hash1.length).toBeGreaterThan(0);
    expect(result2).toBe(false);
    expect(hash2.length).toBeGreaterThan(0);
  });
});
