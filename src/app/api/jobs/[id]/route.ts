import { requireSessionForApi } from "@/lib/api-auth";
import { getJob } from "@/lib/jobs";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { error } = await requireSessionForApi();
  if (error) return error;

  const { id } = await params;
  const job = await getJob(id);
  if (!job) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  return Response.json(job);
}
