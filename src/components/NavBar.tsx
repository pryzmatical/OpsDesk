import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import type { Role } from "@/lib/rbac";

export function NavBar({ role }: { role: Role }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-semibold">
            OpsDesk
          </Link>
          <nav className="flex gap-4 text-sm text-muted">
            <Link href="/dashboard" className="hover:text-foreground">
              Tickets
            </Link>
            <Link
              href="/dashboard/tools/json-formatter"
              className="hover:text-foreground"
            >
              Tools
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="rounded-full bg-border/60 px-2 py-0.5 text-xs font-medium text-foreground">
            {role}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
