import { prisma, TicketStatus } from "@/lib/prisma";
import QueueMonitor from "@/components/queue/QueueMonitor";
import { getSortedQueue, getTodayStrWITA } from "@/lib/queue-logic";

export default async function DisplayPage() {
  const todayStr = getTodayStrWITA();
  const startOfDay = new Date(todayStr + "T00:00:00.000Z");
  
  const sortedQueue = await getSortedQueue();
  
  // also need to fetch currently CALLED/SERVING tickets as they aren't in getSortedQueue
  const currentTickets = await prisma.ticket.findMany({
    where: {
      status: { in: [TicketStatus.CALLED, TicketStatus.SERVING] },
      scheduledDate: { gte: startOfDay },
    },
    include: {
      user: { select: { name: true } }
    }
  });

  const activeTickets = [...currentTickets, ...sortedQueue];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <QueueMonitor initialActiveTickets={activeTickets as unknown as any[]} />;
}

