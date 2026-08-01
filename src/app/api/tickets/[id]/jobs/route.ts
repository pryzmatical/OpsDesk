import { requireSessionForApi, requireAdminForApi } from "@/lib/api-auth";
import { listJobsForTicket, createJobForTicket } from "@/lib/jobs";
import { getTicket } from "@/lib/tickets";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { error } = await requireSessionForApi();
  if (error) return error;

  const { id } = await params;
  const jobs = await listJobsForTicket(id);
  return Response.json(jobs);
}

export async function POST(_request: Request, { params }: RouteParams) {
  const { error } = await requireAdminForApi();
  if (error) return error;

  const { id } = await params;
  const ticket = await getTicket(id);
  if (!ticket) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const job = await createJobForTicket(id);
  return Response.json(job, { status: 201 });
}
