export default function OperatorQueuePage() {
  // Mock queue data
  const queueItems = [
    {
      id: "1",
      ticketNumber: "KS-003",
      userName: "Ahmad Fadli",
      serviceType: "KONSULTASI_STATISTIK",
      serviceName: "Konsultasi Statistik",
      queueNumber: 3,
      scheduledTime: "09:00",
      waitTime: "15 menit",
      status: "waiting",
    },
    {
      id: "2",
      ticketNumber: "PDM-004",
      userName: "Siti Nurhaliza",
      serviceType: "PENJUALAN_DATA_MIKRO",
      serviceName: "Penjualan Data Mikro",
      queueNumber: 4,
      scheduledTime: "09:30",
      waitTime: "45 menit",
      status: "waiting",
    },
    {
      id: "3",
      ticketNumber: "PS-005",
      userName: "Budi Santoso",
      serviceType: "PERPUSTAKAAN_STATISTIK",
      serviceName: "Perpustakaan Statistik",
      queueNumber: 5,
      scheduledTime: "10:00",
      waitTime: "1 jam 15 menit",
      status: "waiting",
    },
  ];

  const currentTicket = {
    ticketNumber: "KS-001",
    userName: "Dewi Lestari",
    serviceType: "KONSULTASI_STATISTIK",
    serviceName: "Konsultasi Statistik",
    queueNumber: 1,
    startedAt: "08:30",
    duration: "12 menit",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4744a] to-[#b85d38] flex items-center justify-center text-white font-bold text-lg">
                OP
              </div>
              <div>
                <h1 className="text-display text-2xl font-bold text-[#0a1628]">Antrian Layanan</h1>
                <p className="text-sm text-[#64748b]">Operator PST • 9 Februari 2026</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 glass rounded-lg">
                <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse-soft" />
                <span className="text-sm font-medium text-[#0a1628]">Sedang Bertugas</span>
              </div>

              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <svg
                  className="w-6 h-6 text-[#64748b]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Current Service */}
          <div className="lg:col-span-2 space-y-6">
            {/* Currently Serving */}
            <div className="animate-slide-in-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-display text-xl font-bold text-[#0a1628]">Sedang Dilayani</h2>
                <button className="px-4 py-2 bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9] text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                    Scan QR Code
                  </span>
                </button>
              </div>

              <div className="glass rounded-2xl p-8 shadow-deep">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="status-badge status-process mb-3">Sedang Diproses</div>
                    <h3 className="text-display text-3xl font-bold text-[#0a1628] mb-2">
                      {currentTicket.ticketNumber}
                    </h3>
                    <p className="text-lg text-[#64748b]">{currentTicket.userName}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-[#64748b] mb-1">Nomor Antrian</div>
                    <div className="queue-number text-5xl">{currentTicket.queueNumber}</div>
                  </div>
                </div>

                <div className="service-konsultasi mb-6">
                  <div
                    className="px-6 py-4 rounded-xl"
                    style={{
                      backgroundColor: "var(--service-bg)",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                        style={{
                          backgroundColor: "var(--service-color)",
                        }}
                      >
                        <svg
                          className="w-7 h-7"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div
                          className="text-lg font-bold mb-1"
                          style={{
                            color: "var(--service-color)",
                          }}
                        >
                          {currentTicket.serviceName}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-[#64748b]">Mulai: {currentTicket.startedAt}</span>
                          <span className="text-[#64748b]">•</span>
                          <span className="font-medium text-[#0a1628]">
                            Durasi: {currentTicket.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full px-6 py-4 bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Selesaikan Layanan
                  </span>
                </button>
              </div>
            </div>

            {/* Waiting Queue */}
            <div className="animate-slide-in-up animation-delay-100">
              <h2 className="text-display text-xl font-bold text-[#0a1628] mb-4">
                Daftar Antrian ({queueItems.length})
              </h2>

              <div className="space-y-4">
                {queueItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="glass rounded-xl p-6 card-interactive animation-delay-200"
                    style={{
                      animationDelay: `${(index + 2) * 100}ms`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center text-white font-bold text-xl">
                          {item.queueNumber}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-display text-lg font-bold text-[#0a1628]">
                              {item.ticketNumber}
                            </h3>
                            <span className="text-sm px-2 py-1 bg-[#fffbeb] text-[#92400e] rounded font-medium">
                              {item.waitTime}
                            </span>
                          </div>
                          <p className="text-[#64748b] mb-2">{item.userName}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="px-3 py-1 bg-[#ecfeff] text-[#164e63] rounded-md font-medium">
                              {item.serviceName}
                            </span>
                            <span className="text-[#64748b]">Jadwal: {item.scheduledTime}</span>
                          </div>
                        </div>
                      </div>

                      <button className="px-6 py-3 bg-gradient-to-r from-[#d4744a] to-[#b85d38] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105">
                        Mulai
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Today's Stats */}
            <div className="glass rounded-xl p-6 shadow-card animate-slide-in-up animation-delay-200">
              <h3 className="text-display text-lg font-bold text-[#0a1628] mb-4">
                Statistik Hari Ini
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#d1fae5] flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-[#10b981]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[#0a1628]">Selesai</span>
                  </div>
                  <span className="text-display text-2xl font-bold text-[#10b981]">12</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#cffafe] flex items-center justify-center">
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
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[#0a1628]">Diproses</span>
                  </div>
                  <span className="text-display text-2xl font-bold text-[#06b6d4]">1</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[#0a1628]">Menunggu</span>
                  </div>
                  <span className="text-display text-2xl font-bold text-[#f59e0b]">3</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#64748b]">Rata-rata waktu layanan</span>
                </div>
                <div className="text-display text-3xl font-bold text-[#0a1628]">18 menit</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-xl p-6 shadow-card animate-slide-in-up animation-delay-300">
              <h3 className="text-display text-lg font-bold text-[#0a1628] mb-4">Aksi Cepat</h3>

              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 text-left transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#f5f3ff] flex items-center justify-center group-hover:scale-110 transition-transform">
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-[#0a1628] text-sm">Riwayat Layanan</div>
                      <div className="text-xs text-[#64748b]">Lihat tiket yang sudah dilayani</div>
                    </div>
                  </div>
                </button>

                <button className="w-full px-4 py-3 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 text-left transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#ecfdf5] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        className="w-5 h-5 text-[#10b981]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-[#0a1628] text-sm">Laporan Harian</div>
                      <div className="text-xs text-[#64748b]">Ekspor data layanan hari ini</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
