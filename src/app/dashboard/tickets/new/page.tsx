import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/rbac";
import { Card } from "@/components/ui/Card";
import { TicketForm } from "@/components/TicketForm";

export default async function NewTicketPage() {
  const session = await getSession();
  if (!isAdmin(session)) redirect("/dashboard");

  return (
    <Card className="max-w-xl p-6">
      <h1 className="mb-4 text-lg font-semibold">New ticket</h1>
      <TicketForm />
    </Card>
  );
}
