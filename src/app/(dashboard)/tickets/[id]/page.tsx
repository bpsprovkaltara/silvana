import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { CancelTicketButton } from "@/components/admin/CancelTicketButton";
import { TicketDetailClient } from "./TicketDetailClient";
import { TicketStatus, ServiceType, Feedback } from "@/generated/prisma";

const statusLabels: Record<TicketStatus, string> = {
  BOOKED: "Booking",
  CHECKED_IN: "Checked In",
  WAITING: "Menunggu",
  CALLED: "Dipanggil",
  SERVING: "Dilayani",
  DONE: "Selesai",
  NO_SHOW: "Tidak Datang",
  CANCELLED: "Dibatalkan",
};

const statusClasses: Record<TicketStatus, string> = {
  BOOKED: "status-pending",
  CHECKED_IN: "status-pending",
  WAITING: "status-pending",
  CALLED: "status-process",
  SERVING: "status-process",
  DONE: "status-done",
  NO_SHOW: "status-cancelled",
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

  // Redirect if ticket is closed
  if (["DONE", "CANCELLED", "NO_SHOW"].includes(ticket.status)) {
    redirect("/tickets");
  }

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
            {["BOOKED", "CHECKED_IN", "WAITING"].includes(ticket.status) && (
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

      <TicketDetailClient 
        initialTicket={{
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          serviceType: ticket.serviceType,
          status: ticket.status,
          scheduledDate: ticket.scheduledDate.toISOString(),
          scheduledTime: ticket.scheduledTime,
          qrCode: ticket.qrCode,
          queueNumber: ticket.queueNumber,
          createdAt: ticket.createdAt.toISOString(),
          startedAt: ticket.startedAt?.toISOString() || null,
          completedAt: ticket.completedAt?.toISOString() || null,
          operator: ticket.operator,
          feedback: ticket.feedback ? {
            rating: ticket.feedback.rating,
            comment: ticket.feedback.comment,
          } : null,
        }} 
      />
    </div>
  );
}
