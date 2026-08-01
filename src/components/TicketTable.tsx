import Link from "next/link";
import { Badge } from "./ui/Badge";
import type { Ticket } from "@/generated/prisma/client";

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

export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return <p className="text-sm text-muted">No tickets yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-border/30 text-left text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-2 font-medium">Title</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Priority</th>
            <th className="px-4 py-2 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-border/10">
              <td className="px-4 py-2.5">
                <Link
                  href={`/dashboard/tickets/${ticket.id}`}
                  className="font-medium hover:underline"
                >
                  {ticket.title}
                </Link>
              </td>
              <td className="px-4 py-2.5">
                <Badge tone={statusTone[ticket.status]}>
                  {ticket.status.replace("_", " ")}
                </Badge>
              </td>
              <td className="px-4 py-2.5">
                <Badge tone={priorityTone[ticket.priority]}>
                  {ticket.priority}
                </Badge>
              </td>
              <td className="px-4 py-2.5 text-muted">
                {new Date(ticket.updatedAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
