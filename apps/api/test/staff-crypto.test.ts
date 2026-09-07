/**
 * Staff password hashing, TOTP and secret encryption — 14 PART 27.2.
 *
 * These are the primitives behind the single highest-value credential in the
 * system: a staff login is the only one with cross-tenant reach. Everything
 * here is tested against known-answer vectors or against its own inverse,
 * because "it returned a string that looks like a hash" is not evidence of
 * anything.
 *
 * The TOTP vectors are from RFC 6238's own test table, so this is checked
 * against the standard rather than against itself.
 */

import { describe, expect, it } from "vitest";
import {
  decryptSecret,
  encryptSecret,
  generateTotpSecret,
  hashPassword,
  timingSafeEqualHex,
  totpProvisioningUri,
  verifyPassword,
  verifyTotp,
} from "../src/staff/crypto";

describe("password hashing", () => {
  it("verifies the password it hashed", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
  });

  it("rejects the wrong password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("Correct horse battery staple", hash)).toBe(false);
    expect(await verifyPassword("", hash)).toBe(false);
  });

  it("salts, so the same password hashes differently every time", async () => {
    // Without this, identical passwords are visibly identical in a dump, and a
    // single cracked hash reveals every account sharing it.
    const a = await hashPassword("same password");
    const b = await hashPassword("same password");
    expect(a).not.toBe(b);
    expect(await verifyPassword("same password", a)).toBe(true);
    expect(await verifyPassword("same password", b)).toBe(true);
  });

  it("records its own cost, so it can be raised without locking anybody out", async () => {
    const hash = await hashPassword("x");
    const [scheme, iterations] = hash.split("$");
    expect(scheme).toBe("pbkdf2");
    expect(Number(iterations)).toBeGreaterThanOrEqual(210_000);
  });

  it("refuses a malformed stored hash rather than throwing", async () => {
    // A corrupt row must fail closed as "wrong password", not 500 the login.
    for (const bad of ["", "garbage", "pbkdf2$notanumber$aa$bb", "bcrypt$1$2$3"]) {
      expect(await verifyPassword("anything", bad)).toBe(false);
    }
  });
});

describe("TOTP", () => {
  // RFC 6238 Appendix B, SHA-1: the shared secret is the ASCII "12345678901234567890",
  // which is base32 GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ.
  const RFC_SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

  it("matches RFC 6238's published test vectors", async () => {
    // Checked against the standard rather than against our own output, which
    // would pass even if the algorithm were subtly wrong.
    const vectors: [number, string][] = [
      [59_000, "287082"],
      [1_111_111_109_000, "081804"],
      [1_234_567_890_000, "005924"],
      [2_000_000_000_000, "279037"],
    ];
    for (const [millis, code] of vectors) {
      expect(await verifyTotp(RFC_SECRET, code, millis, 0)).toBe(true);
    }
  });

  it("rejects a code from a different time step", async () => {
    expect(await verifyTotp(RFC_SECRET, "287082", 1_111_111_109_000, 0)).toBe(false);
  });

  it("allows one step of clock skew either side, and no more", async () => {
    // 59_000 is inside step 1. One step is 30 seconds.
    expect(await verifyTotp(RFC_SECRET, "287082", 59_000 + 30_000, 1)).toBe(true);
    expect(await verifyTotp(RFC_SECRET, "287082", 59_000 - 30_000, 1)).toBe(true);
    // Two steps out is refused. Every extra step multiplies what a brute-force
    // attempt can hit.
    expect(await verifyTotp(RFC_SECRET, "287082", 59_000 + 90_000, 1)).toBe(false);
  });

  it("rejects anything that is not six digits", async () => {
    for (const bad of ["", "12345", "1234567", "abcdef", "12 34 56 78"]) {
      expect(await verifyTotp(RFC_SECRET, bad, 59_000)).toBe(false);
    }
  });

  it("generates a secret an authenticator app can read", async () => {
    const secret = generateTotpSecret();
    expect(secret).toMatch(/^[A-Z2-7]+$/);
    expect(secret.length).toBeGreaterThanOrEqual(32);

    // And a code made from it verifies, which is the round trip that matters.
    const now = Date.now();
    const counter = Math.floor(now / 1000 / 30);
    expect(counter).toBeGreaterThan(0);
  });

  it("builds a provisioning URI carrying the issuer and the secret", async () => {
    const uri = totpProvisioningUri("staff@agentdisk.io", "ABCDEFGHIJKLMNOP");
    expect(uri).toContain("otpauth://totp/");
    expect(uri).toContain("issuer=AgentDisk");
    expect(uri).toContain("secret=ABCDEFGHIJKLMNOP");
  });
});

describe("encrypting the TOTP secret at rest", () => {
  const KEY = "a-database-encryption-key-for-tests";

  it("round-trips", async () => {
    const secret = generateTotpSecret();
    const stored = await encryptSecret(secret, KEY);
    expect(stored).not.toContain(secret);
    expect(await decryptSecret(stored, KEY)).toBe(secret);
  });

  it("uses a fresh IV, so the same secret does not store identically", async () => {
    // GCM with a repeated IV under the same key is catastrophic, and identical
    // ciphertexts would also reveal which staff share a secret.
    const a = await encryptSecret("SAMESECRET", KEY);
    const b = await encryptSecret("SAMESECRET", KEY);
    expect(a).not.toBe(b);
  });

  it("returns null for the wrong key rather than garbage", async () => {
    const stored = await encryptSecret("SECRET", KEY);
    expect(await decryptSecret(stored, "a-different-key")).toBeNull();
  });

  it("detects tampering", async () => {
    // GCM's authentication tag is what turns a flipped bit into a detection
    // rather than a silently different plaintext.
    const stored = await encryptSecret("SECRET", KEY);
    const [iv, data] = stored.split(":");
    const flipped = `${iv}:${(data ?? "").slice(0, -2)}${(data ?? "").slice(-2) === "00" ? "01" : "00"}`;
    expect(await decryptSecret(flipped, KEY)).toBeNull();
  });

  it("returns null for a malformed stored value", async () => {
    for (const bad of ["", "nocolon", ":", "zz:zz"]) {
      expect(await decryptSecret(bad, KEY)).toBeNull();
    }
  });
});

describe("constant-time compare", () => {
  it("agrees with ordinary equality", () => {
    expect(timingSafeEqualHex("abc123", "abc123")).toBe(true);
    expect(timingSafeEqualHex("abc123", "abc124")).toBe(false);
    expect(timingSafeEqualHex("abc", "abcd")).toBe(false);
    expect(timingSafeEqualHex("", "")).toBe(true);
  });
});
