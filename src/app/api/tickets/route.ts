import { z } from "zod";
import { requireSessionForApi, requireAdminForApi } from "@/lib/api-auth";
import { listTickets, createTicket } from "@/lib/tickets";

const TicketSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).default(""),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

export async function GET() {
  const { error } = await requireSessionForApi();
  if (error) return error;

  const tickets = await listTickets();
  return Response.json(tickets);
}

export async function POST(request: Request) {
  const { error } = await requireAdminForApi();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = TicketSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const ticket = await createTicket(parsed.data);
  return Response.json(ticket, { status: 201 });
}
