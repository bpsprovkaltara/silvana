import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminOperatorsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const operators = await prisma.user.findMany({
    where: { role: "OPERATOR" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          operatedTickets: true,
          schedules: true,
        },
      },
      schedules: {
        where: { scheduleDate: { gte: today } },
        orderBy: { scheduleDate: "asc" },
        take: 3,
      },
      operatedTickets: {
        where: { status: "DONE" },
        select: { completedAt: true },
        orderBy: { completedAt: "desc" },
        take: 1,
      },
    },
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-slide-in-up">
        <div>
          <h1 className="text-display text-3xl font-bold text-[#0a1628]">Kelola Operator</h1>
          <p className="text-[#64748b] mt-1">Daftar operator pelayanan statistik terpadu</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-in-up animation-delay-100">
        <div className="glass rounded-xl p-5 shadow-card">
          <div className="text-display text-3xl font-bold text-[#0a1628]">{operators.length}</div>
          <p className="text-sm text-[#64748b]">Total Operator</p>
        </div>
        <div className="glass rounded-xl p-5 shadow-card">
          <div className="text-display text-3xl font-bold text-[#10b981]">
            {operators.filter((o) => o.isActive).length}
          </div>
          <p className="text-sm text-[#64748b]">Operator Aktif</p>
        </div>
        <div className="glass rounded-xl p-5 shadow-card">
          <div className="text-display text-3xl font-bold text-[#06b6d4]">
            {operators.reduce((sum, o) => sum + o._count.operatedTickets, 0)}
          </div>
          <p className="text-sm text-[#64748b]">Total Tiket Dilayani</p>
        </div>
      </div>

      {/* Operators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in-up animation-delay-200">
        {operators.map((operator, index) => (
          <div
            key={operator.id}
            className="glass rounded-2xl p-6 shadow-card card-interactive"
            style={{ animationDelay: `${(index + 2) * 100}ms` }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] flex items-center justify-center text-white text-xl font-bold">
                  {operator.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-display text-lg font-bold text-[#0a1628]">{operator.name}</h3>
                  <p className="text-sm text-[#64748b]">{operator.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${operator.isActive ? "bg-[#10b981] animate-pulse-soft" : "bg-[#64748b]"}`}
                />
                <span className="text-xs font-medium text-[#64748b]">
                  {operator.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-white rounded-lg">
                <div className="text-display text-xl font-bold text-[#0a1628]">
                  {operator._count.operatedTickets}
                </div>
                <div className="text-xs text-[#64748b]">Tiket Dilayani</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-display text-xl font-bold text-[#0a1628]">
                  {operator._count.schedules}
                </div>
                <div className="text-xs text-[#64748b]">Total Jadwal</div>
              </div>
            </div>

            {/* Upcoming Schedules */}
            {operator.schedules.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-[#64748b] mb-2">Jadwal Mendatang:</p>
                <div className="flex flex-wrap gap-2">
                  {operator.schedules.map((schedule) => (
                    <span
                      key={schedule.id}
                      className="px-2.5 py-1 bg-[#ecfeff] text-[#164e63] text-xs font-medium rounded-md"
                    >
                      {new Date(schedule.scheduleDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Last Active */}
            <div className="mt-3 text-xs text-[#64748b]">
              Terdaftar: {new Date(operator.createdAt).toLocaleDateString("id-ID")}
              {operator.operatedTickets[0]?.completedAt && (
                <>
                  {" "}
                  • Terakhir melayani:{" "}
                  {new Date(operator.operatedTickets[0].completedAt).toLocaleDateString("id-ID")}
                </>
              )}
            </div>
          </div>
        ))}

        {operators.length === 0 && (
          <div className="col-span-full glass rounded-2xl p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#f1f5f9] flex items-center justify-center">
              <svg
                className="w-10 h-10 text-[#64748b]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-display text-xl font-bold text-[#0a1628] mb-2">
              Belum Ada Operator
            </h3>
            <p className="text-[#64748b]">Belum ada operator yang terdaftar dalam sistem.</p>
          </div>
        )}
      </div>
    </div>
  );
}
