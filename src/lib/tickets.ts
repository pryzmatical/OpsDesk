import { prisma } from "./prisma";
import type { TicketStatus, Priority } from "@/generated/prisma/client";

export type TicketInput = {
  title: string;
  description: string;
  status?: TicketStatus;
  priority?: Priority;
};

export function listTickets() {
  return prisma.ticket.findMany({ orderBy: { createdAt: "desc" } });
}

export function getTicket(id: string) {
  return prisma.ticket.findUnique({
    where: { id },
    include: { jobs: { orderBy: { createdAt: "desc" } } },
  });
}

export function createTicket(input: TicketInput) {
  return prisma.ticket.create({ data: input });
}

export function updateTicket(id: string, input: Partial<TicketInput>) {
  return prisma.ticket.update({ where: { id }, data: input });
}

export function deleteTicket(id: string) {
  return prisma.ticket.delete({ where: { id } });
}
