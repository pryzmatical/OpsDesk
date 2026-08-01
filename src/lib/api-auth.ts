import { getSession } from "./session";
import {
  requireSession as requireSessionPure,
  requireAdmin as requireAdminPure,
  UnauthorizedError,
  ForbiddenError,
  type Session,
} from "./rbac";

type ApiAuthResult =
  | { session: Session; error: null }
  | { session: null; error: Response };

/** Thin Next-context wrapper: fetches the session, then delegates to the pure,
 * unit-tested rbac checks and converts their errors into HTTP responses. */
export async function requireSessionForApi(): Promise<ApiAuthResult> {
  const session = await getSession();
  try {
    return { session: requireSessionPure(session), error: null };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return {
        session: null,
        error: Response.json({ error: "unauthorized" }, { status: 401 }),
      };
    }
    throw err;
  }
}

export async function requireAdminForApi(): Promise<ApiAuthResult> {
  const session = await getSession();
  try {
    return { session: requireAdminPure(session), error: null };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return {
        session: null,
        error: Response.json({ error: "unauthorized" }, { status: 401 }),
      };
    }
    if (err instanceof ForbiddenError) {
      return {
        session: null,
        error: Response.json({ error: "forbidden" }, { status: 403 }),
      };
    }
    throw err;
  }
}
