export type Role = "ADMIN" | "VIEWER";

export type Session = {
  userId: string;
  role: Role;
};

export class UnauthorizedError extends Error {
  constructor() {
    super("No active session");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("Session does not have the required role");
    this.name = "ForbiddenError";
  }
}

export function isAdmin(session: Session | null): boolean {
  return session?.role === "ADMIN";
}

/** Throws UnauthorizedError if there's no session. Pure — no cookie/redirect side effects. */
export function requireSession(session: Session | null): Session {
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

/** Throws UnauthorizedError/ForbiddenError. Pure — callers decide how to turn that into a 401/403 or a redirect. */
export function requireAdmin(session: Session | null): Session {
  const active = requireSession(session);
  if (!isAdmin(active)) {
    throw new ForbiddenError();
  }
  return active;
}
