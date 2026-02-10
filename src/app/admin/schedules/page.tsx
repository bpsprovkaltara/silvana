import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminSchedulesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get next 14 days of schedules
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 14);

  const [schedules, operators] = await Promise.all([
    prisma.operatorSchedule.findMany({
      where: {
        scheduleDate: { gte: today, lte: endDate },
      },
      include: {
        operator: { select: { name: true, email: true } },
      },
      orderBy: { scheduleDate: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "OPERATOR", isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Group by date
  const groupedSchedules: Record<
    string,
    { id: string; operatorName: string; operatorEmail: string }[]
  > = {};
  schedules.forEach((s) => {
    const key = new Date(s.scheduleDate).toISOString().split("T")[0];
    if (!groupedSchedules[key]) groupedSchedules[key] = [];
    groupedSchedules[key].push({
      id: s.id,
      operatorName: s.operator.name,
      operatorEmail: s.operator.email,
    });
  });

  // Generate 14 days
  const allDates: string[] = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    allDates.push(date.toISOString().split("T")[0]);
  }

  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-slide-in-up">
        <div>
          <h1 className="text-display text-3xl font-bold text-[#0a1628]">Jadwal Operator</h1>
          <p className="text-[#64748b] mt-1">Atur jadwal tugas harian operator</p>
        </div>
      </div>

      {/* Operators Summary */}
      <div className="glass rounded-xl p-5 shadow-card mb-8 animate-slide-in-up animation-delay-100">
        <h3 className="text-sm font-semibold text-[#64748b] mb-3">
          Operator Tersedia ({operators.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {operators.map((op) => (
            <span
              key={op.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-sm"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] flex items-center justify-center text-white text-xs font-semibold">
                {op.name.charAt(0)}
              </div>
              <span className="font-medium text-[#0a1628]">{op.name}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-slide-in-up animation-delay-200">
        {allDates.map((dateStr) => {
          const date = new Date(dateStr + "T00:00:00");
          const dayIndex = date.getDay();
          const isWeekend = dayIndex === 0 || dayIndex === 6;
          const isToday = dateStr === today.toISOString().split("T")[0];
          const ops = groupedSchedules[dateStr] || [];

          return (
            <div
              key={dateStr}
              className={`rounded-xl p-5 shadow-card transition-all ${
                isToday
                  ? "bg-gradient-to-br from-[#d4744a]/10 to-[#b85d38]/10 border-2 border-[#d4744a]/30"
                  : isWeekend
                    ? "bg-slate-100/80 opacity-50"
                    : "glass card-interactive"
              }`}
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
                    {date.toLocaleDateString("id-ID", { month: "short" })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {isToday && (
                    <span className="px-2 py-0.5 bg-[#d4744a] text-white text-xs font-semibold rounded">
                      Hari ini
                    </span>
                  )}
                  {isWeekend && (
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-xs font-semibold rounded">
                      Libur
                    </span>
                  )}
                </div>
              </div>

              {!isWeekend && (
                <div className="pt-3 border-t border-slate-200">
                  {ops.length > 0 ? (
                    <div className="space-y-2">
                      {ops.map((op, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] flex items-center justify-center text-white text-xs font-semibold">
                            {op.operatorName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#0a1628] truncate">
                              {op.operatorName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-xs text-[#64748b] italic">Belum ada jadwal</p>
                    </div>
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
