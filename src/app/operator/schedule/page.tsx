import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CalendarCheck, CalendarDays, Clock } from "lucide-react";
import { format, addDays, startOfDay, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export default async function OperatorSchedulePage() {
  const session = await auth();
  if (!session || session.user.role !== "OPERATOR") redirect("/login");

  const today = startOfDay(new Date());
  const endDate = addDays(today, 30);

  // Fetch this operator's schedules for the next 30 days
  const schedules = await prisma.operatorSchedule.findMany({
    where: {
      operatorId: session.user.id,
      scheduleDate: {
        gte: today,
        lte: endDate,
      },
    },
    orderBy: { scheduleDate: "asc" },
  });

  const scheduleDates = new Set(
    schedules.map((s) =>
      s.scheduleDate.toISOString().split("T")[0]
    )
  );

  const todayStr = format(today, "yyyy-MM-dd");

  // Generate 30 days
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(today, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const isToday = dateStr === todayStr;
    const hasSchedule = scheduleDates.has(dateStr);
    const dayIndex = date.getDay();
    const isWeekend = dayIndex === 0 || dayIndex === 6;
    return { date, dateStr, isToday, hasSchedule, isWeekend };
  });

  const upcomingCount = schedules.length;
  const thisWeek = schedules.filter((s) => {
    const d = new Date(s.scheduleDate);
    return d <= addDays(today, 7);
  }).length;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4744a] to-[#b85d38] flex items-center justify-center text-white shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-display text-2xl sm:text-3xl font-bold text-[#0a1628]">Jadwal Saya</h1>
            <p className="text-sm sm:text-base text-[#64748b]">Tugas Anda dalam 30 hari ke depan</p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 animate-slide-in-up animation-delay-100">
        <div className="glass rounded-xl p-4 sm:p-5 shadow-card text-center">
          <div className="text-display text-2xl sm:text-3xl font-bold text-[#d4744a]">{upcomingCount}</div>
          <p className="text-[10px] sm:text-sm text-[#64748b] mt-1">Total Jadwal</p>
        </div>
        <div className="glass rounded-xl p-4 sm:p-5 shadow-card text-center">
          <div className="text-display text-2xl sm:text-3xl font-bold text-[#06b6d4]">{thisWeek}</div>
          <p className="text-[10px] sm:text-sm text-[#64748b] mt-1">Minggu Ini</p>
        </div>
        <div className="glass rounded-xl p-4 sm:p-5 shadow-card text-center col-span-2 sm:col-span-1">
          <div className="text-display text-xl sm:text-2xl lg:text-3xl font-bold text-[#10b981]">
            {schedules[0]
              ? format(new Date(schedules[0].scheduleDate), "d MMM", { locale: id })
              : "–"}
          </div>
          <p className="text-[10px] sm:text-sm text-[#64748b] mt-1">Jadwal Terdekat</p>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="animate-slide-in-up animation-delay-200">
        <h2 className="text-display text-lg font-bold text-[#0a1628] mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-[#64748b]" />
          Kalender Jadwal
        </h2>

        {upcomingCount === 0 ? (
          <div className="glass rounded-2xl p-12 shadow-card text-center">
            <CalendarCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#0a1628] mb-2">Belum Ada Jadwal</h3>
            <p className="text-[#64748b]">
              Admin belum menambahkan jadwal untuk Anda dalam 30 hari ke depan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 ss:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {days.map(({ date, dateStr, isToday, hasSchedule, isWeekend }) => (
              <div
                key={dateStr}
                className={`
                  rounded-xl p-3 sm:p-4 border-2 transition-all duration-200
                  ${isToday
                    ? "border-[#d4744a] bg-[#d4744a]/5 shadow-md"
                    : hasSchedule
                    ? "border-[#10b981] bg-[#ecfdf5] shadow-sm"
                    : isWeekend
                    ? "border-slate-100 bg-slate-50/50 opacity-60"
                    : "border-slate-200 bg-white/60"
                  }
                `}
              >
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-1 truncate"
                  style={{
                    color: isToday ? "#d4744a" : hasSchedule ? "#059669" : "#94a3b8",
                  }}
                >
                  {format(date, "EEE", { locale: id })}
                </div>
                <div
                  className={`text-display text-xl sm:text-2xl font-bold mb-0.5 ${
                    isToday ? "text-[#d4744a]" : hasSchedule ? "text-[#065f46]" : "text-[#0a1628]"
                  }`}
                >
                  {format(date, "d")}
                </div>
                <div className="text-[10px] text-[#64748b]">{format(date, "MMM", { locale: id })}</div>

                {hasSchedule && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    <span className="text-[8px] sm:text-[10px] font-bold text-[#065f46] uppercase">TUGAS</span>
                  </div>
                )}
                {isToday && !hasSchedule && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Clock className="w-2.5 h-2.5 text-[#d4744a]" />
                    <span className="text-[8px] sm:text-[10px] font-bold text-[#d4744a] uppercase">HARI INI</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[#64748b] animate-slide-in-up animation-delay-300">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-[#10b981] bg-[#ecfdf5]" />
          <span>Jadwal Bertugas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-[#d4744a] bg-[#d4744a]/5" />
          <span>Hari Ini</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-slate-100 bg-slate-50/50 opacity-60" />
          <span>Hari Libur</span>
        </div>
      </div>
    </div>
  );
}
