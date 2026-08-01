import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
} from "@/lib/tickets";

describe("tickets", () => {
  it("creates a ticket with sensible defaults", async () => {
    const created = await createTicket({
      title: "Fix login bug",
      description: "Users can't log in.",
    });
    expect(created.status).toBe("OPEN");
    expect(created.priority).toBe("MEDIUM");

    const fetched = await getTicket(created.id);
    expect(fetched?.title).toBe("Fix login bug");
    expect(fetched?.jobs).toEqual([]);
  });

  it("lists tickets newest first", async () => {
    const first = await createTicket({ title: "First", description: "" });
    const second = await createTicket({ title: "Second", description: "" });

    const tickets = await listTickets();
    expect(tickets.map((t) => t.id)).toEqual([second.id, first.id]);
  });

  it("updates a ticket's status and priority", async () => {
    const created = await createTicket({ title: "Original", description: "" });
    const updated = await updateTicket(created.id, {
      status: "IN_PROGRESS",
      priority: "HIGH",
    });
    expect(updated.status).toBe("IN_PROGRESS");
    expect(updated.priority).toBe("HIGH");
  });

  it("deletes a ticket and cascades to its jobs", async () => {
    const created = await createTicket({ title: "To delete", description: "" });
    await prisma.job.create({ data: { ticketId: created.id, status: "QUEUED" } });

    await deleteTicket(created.id);

    const jobs = await prisma.job.findMany({ where: { ticketId: created.id } });
    expect(jobs).toEqual([]);
    await expect(getTicket(created.id)).resolves.toBeNull();
  });
});
