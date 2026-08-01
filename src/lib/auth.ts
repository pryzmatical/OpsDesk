import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "./rbac";

// Deliberately no `next/headers` import here: this module is pure crypto/logic
// (password hashing, JWT sign/verify) so it can be unit-tested directly under
// Vitest without a Next.js request context. Cookie/session glue lives in
// ./session.ts, which does depend on the Next runtime.

const SALT_ROUNDS = 10;
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8h, matches the JWT's own expiry
export const SESSION_COOKIE_NAME = "session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function getEncodedSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

type TokenPayload = { sub: string; role: Role };

export async function signSessionToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getEncodedSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getEncodedSecret(), {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.sub !== "string" ||
      (payload.role !== "ADMIN" && payload.role !== "VIEWER")
    ) {
      return null;
    }
    return { sub: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}
