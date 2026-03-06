import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CreateScheduleDialog } from "@/components/admin/CreateScheduleDialog";
import { ScheduleCard } from "@/components/admin/ScheduleCard";

export default async function AdminSchedulesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toLocaleDateString("sv-SE");

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
    // scheduleDate is @db.Date, Prisma returns as Date object at 00:00 UTC
    // We treat it as YYYY-MM-DD string directly from the UTC ISO string
    const key = s.scheduleDate.toISOString().split("T")[0];
    if (!groupedSchedules[key]) groupedSchedules[key] = [];
    groupedSchedules[key].push({
      id: s.id,
      operatorName: s.operator.name,
      operatorEmail: s.operator.email,
    });
  });

  // Generate 14 days based on system local time but represented as YYYY-MM-DD
  const allDates: string[] = [];
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    // Use ISO string split to avoid local timezone shifts when generating the key
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    allDates.push(`${year}-${month}-${day}`);
  }

  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-slide-in-up">
        <div>
          <h1 className="text-display text-2xl sm:text-3xl font-bold text-[#0a1628]">Jadwal Operator</h1>
          <p className="text-[#64748b] text-sm sm:text-base mt-1">Atur jadwal tugas harian operator</p>
        </div>
        <CreateScheduleDialog operators={operators} />
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
          // Create date object for display purposes (UI names, weekends)
          const date = new Date(dateStr + "T00:00:00"); 
          const dayIndex = date.getDay();
          const isWeekend = dayIndex === 0 || dayIndex === 6;
          const isToday = dateStr === today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, '0') + "-" + String(today.getDate()).padStart(2, '0');
          const ops = groupedSchedules[dateStr] || [];

          return (
            <ScheduleCard
              key={dateStr}
              dateStr={dateStr}
              isToday={isToday}
              isWeekend={isWeekend}
              dayName={dayNames[dayIndex]}
              operators={ops}
            />
          );
        })}
      </div>
    </div>
  );
}
