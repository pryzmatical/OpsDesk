"use client";

import { useEffect, useState } from "react";
import type { Job } from "@/generated/prisma/client";

const POLL_INTERVAL_MS = 1500;
const TERMINAL_STATUSES = new Set(["SUCCEEDED", "FAILED"]);

export function useJobPolling(initialJob: Job): Job {
  // Callers key the owning component by job id, so a given hook instance
  // only ever sees one `initialJob` for its lifetime — no need to sync it
  // into state on every render.
  const [job, setJob] = useState(initialJob);

  useEffect(() => {
    if (TERMINAL_STATUSES.has(job.status)) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      const response = await fetch(`/api/jobs/${job.id}`);
      if (!response.ok || cancelled) return;
      const updated = await response.json();
      if (!cancelled) setJob(updated);
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [job.id, job.status]);

  return job;
}
