"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";

export function DeleteTicketButton({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this ticket? This cannot be undone.")) return;
    setPending(true);
    const response = await fetch(`/api/tickets/${ticketId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setPending(false);
    }
  }

  return (
    <Button variant="danger" onClick={handleDelete} disabled={pending}>
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
