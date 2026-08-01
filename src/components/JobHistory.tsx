"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { JobStatusBadge } from "./JobStatusBadge";
import { useJobPolling } from "@/hooks/useJobPolling";
import type { Job } from "@/generated/prisma/client";

function JobRow({ job: initialJob }: { job: Job }) {
  const job = useJobPolling(initialJob);
  const result = job.result as { message?: string } | null;

  return (
    <li className="flex items-center justify-between px-4 py-2.5 text-sm">
      <div>
        <p className="font-medium">Enrichment</p>
        <p className="text-xs text-muted">
          {new Date(job.createdAt).toLocaleString()}
        </p>
        {result?.message && (
          <p className="mt-1 text-xs text-muted">{result.message}</p>
        )}
      </div>
      <JobStatusBadge status={job.status} />
    </li>
  );
}

export function JobHistory({
  ticketId,
  initialJobs,
  canTrigger,
}: {
  ticketId: string;
  initialJobs: Job[];
  canTrigger: boolean;
}) {
  const [jobs, setJobs] = useState(initialJobs);
  const [pending, setPending] = useState(false);

  async function triggerJob() {
    setPending(true);
    const response = await fetch(`/api/tickets/${ticketId}/jobs`, {
      method: "POST",
    });
    if (response.ok) {
      const job = await response.json();
      setJobs((prev) => [job, ...prev]);
    }
    setPending(false);
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Jobs</h2>
        {canTrigger && (
          <Button onClick={triggerJob} disabled={pending} variant="secondary">
            {pending ? "Starting..." : "Trigger enrichment"}
          </Button>
        )}
      </div>
      {jobs.length === 0 ? (
        <p className="px-4 py-4 text-sm text-muted">No jobs run yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </ul>
      )}
    </div>
  );
}
