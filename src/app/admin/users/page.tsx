import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const roleLabels: Record<string, string> = {
  VISITOR: "Pengunjung",
  OPERATOR: "Operator",
  ADMIN: "Administrator",
};

const roleBadgeColors: Record<string, string> = {
  VISITOR: "bg-[#ecfeff] text-[#164e63]",
  OPERATOR: "bg-[#f5f3ff] text-[#5b21b6]",
  ADMIN: "bg-[#fef3c7] text-[#92400e]",
};

const professionLabels: Record<string, string> = {
  GOVERNMENT_OFFICIAL: "ASN / Pegawai Pemerintah",
  PRIVATE_EMPLOYEE: "Pegawai Swasta",
  ENTREPRENEUR: "Wirausaha",
  RESEARCHER: "Peneliti / Akademisi",
  STUDENT: "Mahasiswa / Pelajar",
  OTHERS: "Lainnya",
};

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      professionType: true,
      isActive: true,
      createdAt: true,
      _count: { select: { tickets: true } },
    },
  });

  const roleStats = {
    VISITOR: users.filter((u) => u.role === "VISITOR").length,
    OPERATOR: users.filter((u) => u.role === "OPERATOR").length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-slide-in-up">
        <div>
          <h1 className="text-display text-3xl font-bold text-[#0a1628]">Kelola Pengguna</h1>
          <p className="text-[#64748b] mt-1">Daftar seluruh pengguna sistem</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-in-up animation-delay-100">
        <div className="glass rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ecfeff] flex items-center justify-center">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <div className="text-display text-2xl font-bold text-[#0a1628]">
                {roleStats.VISITOR}
              </div>
              <div className="text-xs text-[#64748b]">Pengunjung</div>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#f5f3ff] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-[#8b5cf6]"
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
            <div>
              <div className="text-display text-2xl font-bold text-[#0a1628]">
                {roleStats.OPERATOR}
              </div>
              <div className="text-xs text-[#64748b]">Operator</div>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#fef3c7] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-[#f59e0b]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <div className="text-display text-2xl font-bold text-[#0a1628]">
                {roleStats.ADMIN}
              </div>
              <div className="text-xs text-[#64748b]">Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass rounded-xl shadow-card overflow-hidden animate-slide-in-up animation-delay-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-white/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Pengguna
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden md:table-cell">
                  Pekerjaan
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">
                  Tiket
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">
                  Terdaftar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0a1628] to-[#2c4570] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-[#0a1628]">{user.name}</div>
                        <div className="text-xs text-[#64748b]">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${roleBadgeColors[user.role]}`}
                    >
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748b] hidden md:table-cell">
                    {professionLabels[user.professionType]}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-display font-bold text-[#0a1628]">
                      {user._count.tickets}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${user.isActive ? "bg-[#10b981]" : "bg-[#64748b]"}`}
                      />
                      <span className="text-sm text-[#64748b]">
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748b] hidden lg:table-cell">
                    {new Date(user.createdAt).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
