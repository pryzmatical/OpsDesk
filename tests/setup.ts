import { beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";

// Under Vitest's default resolve conditions, the `server-only` package's
// throwing implementation loads even in this Node test environment (it's
// meant to throw only when bundled into a client component by Next's own
// bundler). It's a no-op safety marker, so it's safe to stub out globally.
vi.mock("server-only", () => ({}));

beforeEach(async () => {
  // FK order: jobs reference tickets, tickets/users are otherwise independent.
  await prisma.job.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();
});
