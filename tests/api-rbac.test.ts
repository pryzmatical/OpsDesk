import { describe, expect, it, vi, beforeAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSessionToken } from "@/lib/auth";

// These two routes are the ones that most matter to get right: logging in,
// and a mutating endpoint that must reject a valid-but-wrong-role session at
// the HTTP layer, not just hide the button in the UI. `next/headers` needs a
// live Next.js request context to work, which doesn't exist when a route
// handler is invoked directly in a test, so it's mocked here with an
// in-memory cookie jar the tests control directly.
let cookieJar = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieJar.get(name);
      return value ? { name, value } : undefined;
    },
    set: (name: string, value: string) => {
      cookieJar.set(name, value);
    },
    delete: (name: string) => {
      cookieJar.delete(name);
    },
  }),
}));

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-not-for-production";
});

describe("DELETE /api/tickets/[id]", () => {
  it("rejects a viewer-role session with 403 and leaves the ticket intact", async () => {
    const { DELETE } = await import("@/app/api/tickets/[id]/route");
    const ticket = await prisma.ticket.create({
      data: { title: "Protected", description: "" },
    });
    cookieJar = new Map([
      ["session", await signSessionToken({ sub: "viewer_1", role: "VIEWER" })],
    ]);

    const response = await DELETE(
      new Request(`http://localhost/api/tickets/${ticket.id}`),
      { params: Promise.resolve({ id: ticket.id }) },
    );

    expect(response.status).toBe(403);
    await expect(
      prisma.ticket.findUnique({ where: { id: ticket.id } }),
    ).resolves.not.toBeNull();
  });

  it("rejects an unauthenticated request with 401", async () => {
    const { DELETE } = await import("@/app/api/tickets/[id]/route");
    const ticket = await prisma.ticket.create({
      data: { title: "Also protected", description: "" },
    });
    cookieJar = new Map();

    const response = await DELETE(
      new Request(`http://localhost/api/tickets/${ticket.id}`),
      { params: Promise.resolve({ id: ticket.id }) },
    );

    expect(response.status).toBe(401);
  });

  it("allows an admin-role session to delete", async () => {
    const { DELETE } = await import("@/app/api/tickets/[id]/route");
    const ticket = await prisma.ticket.create({
      data: { title: "Deletable", description: "" },
    });
    cookieJar = new Map([
      ["session", await signSessionToken({ sub: "admin_1", role: "ADMIN" })],
    ]);

    const response = await DELETE(
      new Request(`http://localhost/api/tickets/${ticket.id}`),
      { params: Promise.resolve({ id: ticket.id }) },
    );

    expect(response.status).toBe(204);
    await expect(
      prisma.ticket.findUnique({ where: { id: ticket.id } }),
    ).resolves.toBeNull();
  });
});

describe("POST /api/auth/login", () => {
  it("issues a session for correct credentials and rejects the wrong password", async () => {
    const { POST } = await import("@/app/api/auth/login/route");
    const passwordHash = await hashPassword("correct-password");
    await prisma.user.create({
      data: {
        email: "login-test@example.com",
        passwordHash,
        role: "ADMIN",
      },
    });

    const good = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "login-test@example.com",
          password: "correct-password",
        }),
      }),
    );
    expect(good.status).toBe(200);

    const bad = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "login-test@example.com",
          password: "wrong-password",
        }),
      }),
    );
    expect(bad.status).toBe(401);
  });
});
