import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SchedulePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get schedules for the next 14 days
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 14);

  const schedules = await prisma.operatorSchedule.findMany({
    where: {
      scheduleDate: { gte: today, lte: endDate },
    },
    include: {
      operator: { select: { name: true } },
    },
    orderBy: { scheduleDate: "asc" },
  });

  // Group schedules by date
  const groupedSchedules: Record<string, { operatorName: string }[]> = {};
  schedules.forEach((schedule) => {
    const dateKey = new Date(schedule.scheduleDate).toISOString().split("T")[0];
    if (!groupedSchedules[dateKey]) {
      groupedSchedules[dateKey] = [];
    }
    groupedSchedules[dateKey].push({
      operatorName: schedule.operator.name,
    });
  });

  // Generate all dates for 14 days
  const allDates: string[] = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    allDates.push(date.toISOString().split("T")[0]);
  }

  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-in-up">
        <h1 className="text-display text-3xl font-bold text-[#0a1628]">Jadwal Layanan</h1>
        <p className="text-[#64748b] mt-1">Lihat jadwal operator yang bertugas 14 hari ke depan</p>
      </div>

      {/* Info Card */}
      <div className="glass rounded-xl p-5 shadow-card mb-8 animate-slide-in-up animation-delay-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#ecfeff] flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-[#06b6d4]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-[#0a1628] mb-1">Informasi Jadwal</h3>
            <p className="text-sm text-[#64748b]">
              Layanan tersedia pada hari kerja (Senin - Jumat), pukul 08:00 - 15:00 WIB. Pastikan
              untuk membuat tiket terlebih dahulu sebelum datang.
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-in-up animation-delay-200">
        {allDates.map((dateStr, index) => {
          const date = new Date(dateStr + "T00:00:00");
          const dayIndex = date.getDay();
          const isWeekend = dayIndex === 0 || dayIndex === 6;
          const isToday = dateStr === today.toISOString().split("T")[0];
          const operators = groupedSchedules[dateStr] || [];

          return (
            <div
              key={dateStr}
              className={`rounded-xl p-5 shadow-card transition-all ${
                isToday
                  ? "bg-gradient-to-br from-[#d4744a]/10 to-[#b85d38]/10 border-2 border-[#d4744a]/30"
                  : isWeekend
                    ? "bg-slate-100/80 opacity-60"
                    : "glass card-interactive"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p
                    className={`text-xs font-semibold uppercase tracking-wider ${isToday ? "text-[#d4744a]" : "text-[#64748b]"}`}
                  >
                    {dayNames[dayIndex]}
                  </p>
                  <p className="text-display text-2xl font-bold text-[#0a1628]">{date.getDate()}</p>
                  <p className="text-xs text-[#64748b]">
                    {date.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                  </p>
                </div>
                {isToday && (
                  <span className="px-2 py-1 bg-[#d4744a] text-white text-xs font-semibold rounded-md">
                    Hari ini
                  </span>
                )}
                {isWeekend && (
                  <span className="px-2 py-1 bg-slate-200 text-slate-500 text-xs font-semibold rounded-md">
                    Libur
                  </span>
                )}
              </div>

              {!isWeekend && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  {operators.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-[#64748b] font-medium">Operator Bertugas:</p>
                      {operators.map((op, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                          <span className="text-sm font-medium text-[#0a1628]">
                            {op.operatorName}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#64748b] italic">Belum ada jadwal operator</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
