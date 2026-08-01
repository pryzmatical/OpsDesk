import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/rbac";
import { getTicket } from "@/lib/tickets";
import { Card } from "@/components/ui/Card";
import { TicketForm } from "@/components/TicketForm";

export default async function EditTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const { id } = await params;
  if (!isAdmin(session)) redirect(`/dashboard/tickets/${id}`);

  const ticket = await getTicket(id);
  if (!ticket) notFound();

  return (
    <Card className="max-w-xl p-6">
      <h1 className="mb-4 text-lg font-semibold">Edit ticket</h1>
      <TicketForm ticket={ticket} />
    </Card>
  );
}
