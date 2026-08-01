import { Badge } from "./ui/Badge";
import type { JobStatus } from "@/generated/prisma/client";

const tone = {
  QUEUED: "neutral",
  RUNNING: "blue",
  SUCCEEDED: "green",
  FAILED: "red",
} as const;

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return <Badge tone={tone[status]}>{status}</Badge>;
}
