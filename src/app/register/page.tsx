"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const PROFESSION_OPTIONS = [
  { value: "GOVERNMENT_OFFICIAL", label: "ASN / Pegawai Pemerintah" },
  { value: "PRIVATE_EMPLOYEE", label: "Pegawai Swasta" },
  { value: "ENTREPRENEUR", label: "Wirausaha" },
  { value: "RESEARCHER", label: "Peneliti / Akademisi" },
  { value: "STUDENT", label: "Mahasiswa / Pelajar" },
  { value: "OTHERS", label: "Lainnya" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [professionType, setProfessionType] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sesuai");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    if (!professionType) {
      setError("Pilih jenis pekerjaan Anda");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          professionType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Terjadi kesalahan saat registrasi");
        return;
      }

      // Redirect to login with success message
      router.push("/login?registered=true");
    } catch {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-[#0a1628] focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-[#06b6d4]"
      >
        Skip to main content
      </a>

      <main
        id="main-content"
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#06b6d4]/10 to-transparent rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#d4744a]/10 to-transparent rounded-full blur-3xl animation-delay-200 animate-pulse-soft" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-[#10b981]/5 to-transparent rounded-full blur-3xl animation-delay-400 animate-pulse-soft" />
        </div>

        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10">
          {/* Left side - Branding */}
          <div className="hidden md:block space-y-6 animate-slide-in-up">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50">
                <div className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse-soft" />
                <span className="text-sm font-medium text-[#0a1628]">Pendaftaran Akun Baru</span>
              </div>

              <h1 className="text-display text-6xl font-bold text-[#0a1628] leading-tight">
                Silvana
              </h1>

              <div className="space-y-2">
                <p className="text-2xl text-[#2c4570] font-medium">Pelayanan Statistik Terpadu</p>
                <p className="text-lg text-[#64748b]">BPS Provinsi Kalimantan Utara</p>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
                <h3 className="font-semibold text-[#0a1628] mb-2">Mengapa perlu mendaftar?</h3>
                <ul className="space-y-2 text-sm text-[#64748b]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#10b981] mt-0.5">&#10003;</span>
                    <span>Buat tiket layanan statistik secara online</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#10b981] mt-0.5">&#10003;</span>
                    <span>Pantau status antrian secara real-time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#10b981] mt-0.5">&#10003;</span>
                    <span>Dapatkan QR code untuk kemudahan verifikasi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#10b981] mt-0.5">&#10003;</span>
                    <span>Riwayat layanan tersimpan otomatis</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right side - Register Form */}
          <div className="animate-slide-in-up animation-delay-200">
            <div className="glass rounded-2xl p-8 shadow-deep">
              <div className="mb-6">
                <h2 className="text-display text-3xl font-bold text-[#0a1628] mb-2">Daftar Akun</h2>
                <p className="text-[#64748b]">Buat akun baru untuk mengakses layanan</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-sm font-semibold text-[#0a1628]">
                    Nama Lengkap
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-semibold text-[#0a1628]">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="profession"
                    className="block text-sm font-semibold text-[#0a1628]"
                  >
                    Jenis Pekerjaan
                  </label>
                  <select
                    id="profession"
                    value={professionType}
                    onChange={(e) => setProfessionType(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent transition-all text-slate-700"
                  >
                    <option value="" disabled>
                      Pilih jenis pekerjaan
                    </option>
                    {PROFESSION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-[#0a1628]"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      placeholder="Min. 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-semibold text-[#0a1628]"
                    >
                      Konfirmasi
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Ulangi password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3.5 bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Memproses..." : "Daftar Sekarang"}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 backdrop-blur-sm text-[#64748b]">
                      sudah punya akun?
                    </span>
                  </div>
                </div>

                <a
                  href="/login"
                  className="block w-full px-6 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-[#0a1628] text-[#0a1628] font-semibold rounded-lg hover:bg-[#0a1628] hover:text-white transition-all duration-300 text-center"
                >
                  Masuk ke Akun
                </a>
              </form>
            </div>

            {/* Mobile branding */}
            <div className="md:hidden mt-8 text-center animate-slide-in-up animation-delay-300">
              <h1 className="text-display text-4xl font-bold text-[#0a1628] mb-2">Silvana</h1>
              <p className="text-[#64748b]">Pelayanan Statistik Terpadu BPS Kalimantan Utara</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-4 left-0 right-0 text-center text-sm text-[#64748b]">
          <p>&copy; 2026 BPS Provinsi Kalimantan Utara. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}
