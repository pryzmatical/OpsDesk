import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth";
import type { Ticket } from "../src/generated/prisma/client";

async function main() {
  const [adminHash, viewerHash] = await Promise.all([
    hashPassword("admin12345"),
    hashPassword("viewer12345"),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "viewer@example.com" },
    update: {},
    create: {
      email: "viewer@example.com",
      passwordHash: viewerHash,
      role: "VIEWER",
    },
  });

  const existingTickets = await prisma.ticket.count();
  if (existingTickets > 0) {
    console.log(`Skipping ticket/job seed — ${existingTickets} ticket(s) already exist.`);
    console.log(`Seeded users: admin@example.com (id ${admin.id}), viewer@example.com.`);
    return;
  }

  const ticketSeeds = [
    { title: "Password reset emails not sending", description: "Users report no email arrives after requesting a password reset. Suspect the notification queue.", status: "OPEN", priority: "HIGH" },
    { title: "Add CSV export to reports page", description: "Sales asked for a one-click CSV export of the monthly summary table.", status: "OPEN", priority: "LOW" },
    { title: "Dashboard chart flickers on load", description: "The revenue chart briefly renders empty axes before data populates.", status: "IN_PROGRESS", priority: "MEDIUM" },
    { title: "Migrate legacy webhook handler", description: "Old webhook endpoint still uses the deprecated signature format.", status: "IN_PROGRESS", priority: "HIGH" },
    { title: "Typo in onboarding email subject", description: "\"Welcome to OpsDesk\" is misspelled as \"Welcom to OpsDesk\".", status: "CLOSED", priority: "LOW" },
    { title: "Quarterly access review", description: "Confirm all admin accounts still need admin access.", status: "CLOSED", priority: "MEDIUM" },
  ] as const;

  // Created sequentially (and in reverse) rather than via Promise.all so each
  // row gets a distinct `createdAt` — concurrent creates can land on the same
  // millisecond, which made the dashboard's "newest first" sort invisible on
  // fresh seed data. Reversed so ticketSeeds[0] ends up as the most recent.
  const createdInReverseOrder: Ticket[] = [];
  for (const data of [...ticketSeeds].reverse()) {
    createdInReverseOrder.push(await prisma.ticket.create({ data }));
  }
  const tickets = createdInReverseOrder.reverse();

  await prisma.job.createMany({
    data: [
      {
        ticketId: tickets[2].id,
        status: "SUCCEEDED",
        result: { message: "Enrichment completed.", score: 87 },
      },
      {
        ticketId: tickets[3].id,
        status: "FAILED",
        result: { message: "Enrichment failed: upstream lookup timed out." },
      },
      {
        ticketId: tickets[4].id,
        status: "SUCCEEDED",
        result: { message: "Enrichment completed.", score: 64 },
      },
    ],
  });

  console.log(`Seeded users: admin@example.com (id ${admin.id}), viewer@example.com.`);
  console.log(`Seeded ${tickets.length} tickets and 3 jobs.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
