import makePassword from "../src/utils/password_endec";

describe("makePassword", () => {
  it("should return a hash of the password concatenated with the salt", () => {
    const password = "testPassword";
    const salt = "randomSalt";
    const hash1 = makePassword(password, salt);
    const hash2 = makePassword(password, salt)
    expect(hash1).toBeInstanceOf(String);
    expect(hash1.length).toBeGreaterThan(0);
    expect(hash2).toBeInstanceOf(String);
    expect(hash2.length).toBeGreaterThan(0);
    expect(hash1).not.toBe(hash2);
  }
)
});
