import { Suspense } from "react";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm p-6">
        <h1 className="mb-1 text-lg font-semibold">OpsDesk</h1>
        <p className="mb-6 text-sm text-muted">Sign in to continue.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
        <div className="mt-6 rounded-md border border-border bg-background p-3 text-xs text-muted">
          <p className="mb-1 font-medium text-foreground">Demo accounts</p>
          <p>admin@example.com / admin12345 (full access)</p>
          <p>viewer@example.com / viewer12345 (read-only)</p>
        </div>
      </Card>
    </div>
  );
}
