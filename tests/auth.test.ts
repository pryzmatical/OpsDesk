import { describe, expect, it, beforeAll } from "vitest";
import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  verifySessionToken,
} from "@/lib/auth";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-not-for-production";
});

describe("password hashing", () => {
  it("verifies a matching password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    await expect(verifyPassword("correct-horse-battery-staple", hash)).resolves.toBe(
      true,
    );
  });

  it("rejects a non-matching password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("produces a different hash each time (salted)", async () => {
    const [a, b] = await Promise.all([
      hashPassword("same-password"),
      hashPassword("same-password"),
    ]);
    expect(a).not.toEqual(b);
  });
});

describe("session tokens", () => {
  it("round-trips a valid token", async () => {
    const token = await signSessionToken({ sub: "user_1", role: "ADMIN" });
    const payload = await verifySessionToken(token);
    expect(payload).toEqual({ sub: "user_1", role: "ADMIN" });
  });

  it("rejects a tampered token", async () => {
    const token = await signSessionToken({ sub: "user_1", role: "VIEWER" });
    const tampered = token.slice(0, -2) + (token.at(-2) === "a" ? "b" : "a") + token.at(-1);
    await expect(verifySessionToken(tampered)).resolves.toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signSessionToken({ sub: "user_1", role: "ADMIN" });
    process.env.JWT_SECRET = "a-different-secret";
    await expect(verifySessionToken(token)).resolves.toBeNull();
    process.env.JWT_SECRET = "test-secret-not-for-production";
  });

  it("rejects an already-expired token", async () => {
    const { SignJWT } = await import("jose");
    const expired = await new SignJWT({ role: "ADMIN" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("user_1")
      .setIssuedAt(Math.floor(Date.now() / 1000) - 120)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    await expect(verifySessionToken(expired)).resolves.toBeNull();
  });

  it("rejects a token with an invalid role claim", async () => {
    const { SignJWT } = await import("jose");
    const badRole = await new SignJWT({ role: "SUPERUSER" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("user_1")
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    await expect(verifySessionToken(badRole)).resolves.toBeNull();
  });
});
