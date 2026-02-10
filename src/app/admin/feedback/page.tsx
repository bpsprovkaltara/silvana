import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminFeedbackPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const [feedbacks, avgRating, ratingDistribution] = await Promise.all([
    prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        ticket: {
          select: {
            ticketNumber: true,
            serviceType: true,
            operator: { select: { name: true } },
          },
        },
      },
    }),
    prisma.feedback.aggregate({ _avg: { rating: true }, _count: true }),
    prisma.feedback.groupBy({
      by: ["rating"],
      _count: true,
      orderBy: { rating: "desc" },
    }),
  ]);

  const serviceLabels: Record<string, string> = {
    KONSULTASI_STATISTIK: "Konsultasi Statistik",
    PENJUALAN_DATA_MIKRO: "Penjualan Data Mikro",
    PERPUSTAKAAN_STATISTIK: "Perpustakaan Statistik",
    REKOMENDASI_KEGIATAN_STATISTIK: "Rekomendasi Kegiatan",
  };

  // Build rating distribution
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDistribution.forEach((r) => {
    distribution[r.rating] = r._count;
  });
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-in-up">
        <h1 className="text-display text-3xl font-bold text-[#0a1628]">Feedback Pengunjung</h1>
        <p className="text-[#64748b] mt-1">Penilaian dan masukan dari pengunjung layanan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feedback List */}
        <div className="lg:col-span-2 animate-slide-in-up animation-delay-100">
          <div className="space-y-4">
            {feedbacks.map((feedback, index) => (
              <div
                key={feedback.id}
                className="glass rounded-xl p-6 shadow-card card-interactive"
                style={{ animationDelay: `${(index + 1) * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0a1628] to-[#2c4570] flex items-center justify-center text-white text-sm font-semibold">
                      {feedback.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0a1628]">{feedback.user.name}</h3>
                      <p className="text-xs text-[#64748b]">
                        {feedback.ticket.ticketNumber} •{" "}
                        {serviceLabels[feedback.ticket.serviceType]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= feedback.rating ? "text-[#f59e0b]" : "text-slate-300"}`}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs text-[#64748b] mt-1">
                      {new Date(feedback.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>

                {feedback.comment && (
                  <div className="mt-3 p-4 bg-white/50 rounded-lg">
                    <p className="text-sm text-[#0a1628] italic">
                      &ldquo;{feedback.comment}&rdquo;
                    </p>
                  </div>
                )}

                {feedback.ticket.operator && (
                  <div className="mt-3 text-xs text-[#64748b]">
                    Dilayani oleh:{" "}
                    <span className="font-medium text-[#0a1628]">
                      {feedback.ticket.operator.name}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {feedbacks.length === 0 && (
              <div className="glass rounded-2xl p-12 text-center">
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
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <h3 className="text-display text-xl font-bold text-[#0a1628] mb-2">
                  Belum Ada Feedback
                </h3>
                <p className="text-[#64748b]">Belum ada feedback dari pengunjung.</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6 animate-slide-in-up animation-delay-200">
          {/* Overall Rating */}
          <div className="glass rounded-xl p-6 shadow-card">
            <h3 className="text-display text-lg font-bold text-[#0a1628] mb-4">
              Rating Keseluruhan
            </h3>
            <div className="text-center mb-6">
              <div className="text-display text-5xl font-bold text-[#f59e0b]">
                {avgRating._avg.rating ? avgRating._avg.rating.toFixed(1) : "-"}
              </div>
              <div className="flex items-center justify-center gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-6 h-6 ${star <= Math.round(avgRating._avg.rating || 0) ? "text-[#f59e0b]" : "text-slate-300"}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-[#64748b] mt-2">{avgRating._count} total feedback</p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="glass rounded-xl p-6 shadow-card">
            <h3 className="text-display text-lg font-bold text-[#0a1628] mb-4">
              Distribusi Rating
            </h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[#0a1628] w-4">{rating}</span>
                  <svg className="w-4 h-4 text-[#f59e0b]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] rounded-full transition-all duration-500"
                      style={{
                        width: `${(distribution[rating] / maxCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-[#64748b] w-8 text-right">
                    {distribution[rating]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
