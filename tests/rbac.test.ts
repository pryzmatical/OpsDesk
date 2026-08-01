import { describe, expect, it } from "vitest";
import {
  isAdmin,
  requireSession,
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
  type Session,
} from "@/lib/rbac";

const admin: Session = { userId: "u1", role: "ADMIN" };
const viewer: Session = { userId: "u2", role: "VIEWER" };

describe("isAdmin", () => {
  it("is true for an admin session", () => {
    expect(isAdmin(admin)).toBe(true);
  });

  it("is false for a viewer session", () => {
    expect(isAdmin(viewer)).toBe(false);
  });

  it("is false for no session", () => {
    expect(isAdmin(null)).toBe(false);
  });
});

describe("requireSession", () => {
  it("returns the session when present", () => {
    expect(requireSession(admin)).toBe(admin);
    expect(requireSession(viewer)).toBe(viewer);
  });

  it("throws UnauthorizedError when there is no session", () => {
    expect(() => requireSession(null)).toThrow(UnauthorizedError);
  });
});

describe("requireAdmin", () => {
  it("returns the session for an admin", () => {
    expect(requireAdmin(admin)).toBe(admin);
  });

  it("throws ForbiddenError for a viewer", () => {
    expect(() => requireAdmin(viewer)).toThrow(ForbiddenError);
  });

  it("throws UnauthorizedError (not ForbiddenError) for no session", () => {
    expect(() => requireAdmin(null)).toThrow(UnauthorizedError);
  });
});
