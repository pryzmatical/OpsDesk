import Link from "next/link";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/rbac";
import { listTickets } from "@/lib/tickets";
import { TicketTable } from "@/components/TicketTable";
import { Button } from "@/components/ui/Button";

export default async function DashboardPage() {
  const [session, tickets] = await Promise.all([getSession(), listTickets()]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tickets</h1>
        {isAdmin(session) && (
          <Link href="/dashboard/tickets/new">
            <Button>New ticket</Button>
          </Link>
        )}
      </div>
      <TicketTable tickets={tickets} />
    </div>
  );
}
