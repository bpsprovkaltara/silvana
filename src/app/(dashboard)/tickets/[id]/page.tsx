import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { CancelTicketButton } from "@/components/admin/CancelTicketButton";
import { TicketDetailClient } from "./TicketDetailClient";

const statusLabels: Record<string, string> = {
  PENDING: "Menunggu",
  ON_PROCESS: "Sedang Diproses",
  DONE: "Selesai",
  CANCELLED: "Dibatalkan",
};

const statusClasses: Record<string, string> = {
  PENDING: "status-pending",
  ON_PROCESS: "status-process",
  DONE: "status-done",
  CANCELLED: "status-cancelled",
};

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id, userId: session.user.id },
    include: {
      operator: { select: { name: true } },
      feedback: true,
    },
  });

  if (!ticket) notFound();

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-in-up">
        <Link
          href="/tickets"
          className="flex items-center gap-2 text-sm font-medium text-[#64748b] hover:text-[#0a1628] transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Kembali ke Tiket
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <span className={`status-badge ${statusClasses[ticket.status]}`}>
              {statusLabels[ticket.status]}
            </span>
            <h1 className="text-display text-4xl font-bold text-[#0a1628] mt-3">
              {ticket.ticketNumber}
            </h1>
            {ticket.status === "PENDING" && (
              <div className="mt-4">
                <CancelTicketButton
                  ticketId={ticket.id}
                  ticketNumber={ticket.ticketNumber}
                  variant="button"
                />
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-[#64748b] mb-1">Nomor Antrian</div>
            <div className="queue-number text-5xl">{ticket.queueNumber}</div>
          </div>
        </div>
      </div>

      <TicketDetailClient initialTicket={ticket} />
    </div>
  );
}
