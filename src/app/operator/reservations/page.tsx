import { auth } from "@/lib/auth";
import { prisma, TicketStatus, TicketSource } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import UpcomingReservations from "@/components/queue/UpcomingReservations";

export default async function OperatorReservationsPage() {
  const session = await auth();
  if (!session || session.user.role !== "OPERATOR") redirect("/login");

  // Use WITA (Asia/Makassar) to define "today"
  const todayStrStr = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Makassar" });
  const today = new Date(todayStrStr + "T00:00:00.000Z");

  // Fetch all reservations that are not completed or cancelled
  const reservations = await prisma.ticket.findMany({
    where: {
      source: TicketSource.RESERVATION,
      status: {
        notIn: [TicketStatus.DONE, TicketStatus.CANCELLED, TicketStatus.NO_SHOW],
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      { scheduledDate: "asc" },
      { scheduledTime: "asc" },
    ],
  });

  // Log for debugging
  console.log(`Found ${reservations.length} total reservations`);
  if (reservations.length > 0) {
    console.log("First reservation sample:", {
      id: reservations[0].id,
      date: reservations[0].scheduledDate,
      source: reservations[0].source,
      status: reservations[0].status
    });
  }

  // Grouping - filtered by today onwards for display
  const groupedReservations = reservations.reduce((acc: any, ticket) => {
    // We keep reservations from today onwards
    if (ticket.scheduledDate >= today) {
      const dateKey = ticket.scheduledDate.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(ticket);
    }
    return acc;
  }, {});

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 animate-slide-in-up">
        <div>
          <h1 className="text-display text-2xl sm:text-3xl font-bold text-[#0a1628]">Jadwal Reservasi</h1>
          <p className="text-[#64748b] text-sm sm:text-base mt-1">
            Daftar pengunjung yang telah melakukan booking untuk hari mendatang
          </p>
        </div>
        <Link 
          href="/operator/queue"
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm w-fit"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden xs:inline">Kembali ke Antrian</span>
          <span className="xs:hidden">Kembali</span>
        </Link>
      </div>

      <UpcomingReservations groupedReservations={groupedReservations} />
    </div>
  );
}
