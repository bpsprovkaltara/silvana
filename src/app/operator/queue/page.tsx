import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { QueueClient } from "./QueueClient";

export default async function OperatorQueuePage() {
  const session = await auth();
  if (!session || session.user.role !== "OPERATOR") redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get current ticket being processed
  const currentTicket = await prisma.ticket.findFirst({
    where: {
      status: "ON_PROCESS",
      operatorId: session.user.id,
    },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  // Get pending tickets for today
  const pendingTickets = await prisma.ticket.findMany({
    where: {
      status: "PENDING",
      scheduledDate: { gte: today, lt: tomorrow },
    },
    orderBy: [{ scheduledTime: "asc" }, { queueNumber: "asc" }],
    include: {
      user: { select: { name: true } },
    },
  });

  // Stats
  const completedToday = await prisma.ticket.count({
    where: {
      status: "DONE",
      operatorId: session.user.id,
      completedAt: { gte: today },
    },
  });

  const initialData = {
    current: currentTicket,
    pending: pendingTickets,
    completedTodayCount: completedToday,
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-slide-in-up">
        <div>
          <h1 className="text-display text-3xl font-bold text-[#0a1628]">Antrian Layanan</h1>
          <p className="text-[#64748b] mt-1">
            {today.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass rounded-lg shadow-card">
          <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse-soft" />
          <span className="text-sm font-medium text-[#0a1628]">Sedang Bertugas</span>
        </div>
      </div>

      <QueueClient initialData={initialData} />
    </div>
  );
}
