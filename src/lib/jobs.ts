import { prisma } from "./prisma";
import type { JobStatus, Prisma } from "@/generated/prisma/client";

const RUNNING_DELAY_MS = 800;
const TERMINAL_DELAY_MS = 2500;

export function listJobsForTicket(ticketId: string) {
  return prisma.job.findMany({
    where: { ticketId },
    orderBy: { createdAt: "desc" },
  });
}

export function getJob(id: string) {
  return prisma.job.findUnique({ where: { id } });
}

export function simulateJobOutcome(random: () => number = Math.random): {
  status: Extract<JobStatus, "SUCCEEDED" | "FAILED">;
  result: Prisma.InputJsonObject;
} {
  const succeeded = random() > 0.2; // ~80% success rate
  if (succeeded) {
    return {
      status: "SUCCEEDED",
      result: {
        message: "Enrichment completed.",
        score: Math.round(random() * 100),
      },
    };
  }
  return {
    status: "FAILED",
    result: { message: "Enrichment failed: upstream lookup timed out." },
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runJobAsync(
  jobId: string,
  delays: { running: number; terminal: number } = {
    running: RUNNING_DELAY_MS,
    terminal: TERMINAL_DELAY_MS,
  },
): Promise<void> {
  try {
    await sleep(delays.running);
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "RUNNING" },
    });

    await sleep(delays.terminal);
    const outcome = simulateJobOutcome();
    await prisma.job.update({
      where: { id: jobId },
      data: { status: outcome.status, result: outcome.result },
    });
  } catch (err) {
    // The ticket (and its jobs, via cascade) may have been deleted while this
    // was in flight — nothing left to update in that case.
    console.error(`runJobAsync(${jobId}) failed:`, err);
  }
}

export async function createJobForTicket(ticketId: string) {
  const job = await prisma.job.create({
    data: { ticketId, status: "QUEUED" },
  });
  void runJobAsync(job.id);
  return job;
}
