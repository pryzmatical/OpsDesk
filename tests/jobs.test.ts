import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { runJobAsync, simulateJobOutcome } from "@/lib/jobs";

describe("simulateJobOutcome", () => {
  it("returns SUCCEEDED with a result payload when the roll is high", () => {
    const outcome = simulateJobOutcome(() => 0.9);
    expect(outcome.status).toBe("SUCCEEDED");
    expect(outcome.result.message).toBeTypeOf("string");
  });

  it("returns FAILED when the roll is low", () => {
    const outcome = simulateJobOutcome(() => 0.1);
    expect(outcome.status).toBe("FAILED");
    expect(outcome.result.message).toBeTypeOf("string");
  });

  it("is deterministic for a given RNG", () => {
    const a = simulateJobOutcome(() => 0.5);
    const b = simulateJobOutcome(() => 0.5);
    expect(a).toEqual(b);
  });
});

describe("runJobAsync", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("drives a job QUEUED -> RUNNING -> a terminal status", async () => {
    const ticket = await prisma.ticket.create({
      data: { title: "Enrich this", description: "" },
    });
    const job = await prisma.job.create({
      data: { ticketId: ticket.id, status: "QUEUED" },
    });

    const promise = runJobAsync(job.id, { running: 10, terminal: 10 });

    await vi.advanceTimersByTimeAsync(10);
    const running = await prisma.job.findUniqueOrThrow({ where: { id: job.id } });
    expect(running.status).toBe("RUNNING");

    await vi.advanceTimersByTimeAsync(10);
    await promise;

    const finished = await prisma.job.findUniqueOrThrow({ where: { id: job.id } });
    expect(["SUCCEEDED", "FAILED"]).toContain(finished.status);
    expect(finished.result).not.toBeNull();
  });
});
