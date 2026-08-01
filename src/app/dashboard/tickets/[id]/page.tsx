import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/rbac";
import { getTicket } from "@/lib/tickets";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DeleteTicketButton } from "@/components/DeleteTicketButton";
import { JobHistory } from "@/components/JobHistory";

const statusTone = {
  OPEN: "blue",
  IN_PROGRESS: "amber",
  CLOSED: "green",
} as const;

const priorityTone = {
  LOW: "neutral",
  MEDIUM: "purple",
  HIGH: "red",
} as const;

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, ticket] = await Promise.all([getSession(), getTicket(id)]);
  if (!ticket) notFound();

  const admin = isAdmin(session);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{ticket.title}</h1>
            <div className="mt-2 flex gap-2">
              <Badge tone={statusTone[ticket.status]}>
                {ticket.status.replace("_", " ")}
              </Badge>
              <Badge tone={priorityTone[ticket.priority]}>
                {ticket.priority}
              </Badge>
            </div>
          </div>
          {admin && (
            <div className="flex gap-2">
              <Link href={`/dashboard/tickets/${ticket.id}/edit`}>
                <Button variant="secondary">Edit</Button>
              </Link>
              <DeleteTicketButton ticketId={ticket.id} />
            </div>
          )}
        </div>
        <p className="whitespace-pre-wrap text-sm text-foreground">
          {ticket.description || (
            <span className="text-muted">No description.</span>
          )}
        </p>
        <p className="mt-4 text-xs text-muted">
          Updated {new Date(ticket.updatedAt).toLocaleString()}
        </p>
      </Card>

      <JobHistory
        ticketId={ticket.id}
        initialJobs={ticket.jobs}
        canTrigger={admin}
      />
    </div>
  );
}
