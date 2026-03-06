import { prisma } from "@/lib/prisma";
import QueueMonitor from "@/components/queue/QueueMonitor";

export default async function DisplayPage() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const activeTickets = await prisma.ticket.findMany({
    where: {
      status: { in: ["ON_PROCESS", "PENDING"] },
      createdAt: { gte: startOfDay },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <QueueMonitor initialActiveTickets={activeTickets as unknown as any[]} />;
}
