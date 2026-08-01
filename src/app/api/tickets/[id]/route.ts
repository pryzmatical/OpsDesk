import { z } from "zod";
import { requireSessionForApi, requireAdminForApi } from "@/lib/api-auth";
import { getTicket, updateTicket, deleteTicket } from "@/lib/tickets";

const TicketUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { error } = await requireSessionForApi();
  if (error) return error;

  const { id } = await params;
  const ticket = await getTicket(id);
  if (!ticket) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  return Response.json(ticket);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { error } = await requireAdminForApi();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = TicketUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const ticket = await updateTicket(id, parsed.data);
  return Response.json(ticket);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { error } = await requireAdminForApi();
  if (error) return error;

  const { id } = await params;
  await deleteTicket(id);
  return new Response(null, { status: 204 });
}
