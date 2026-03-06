"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";
import { Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError("Email atau password salah");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-gradient-to-br from-[#d4744a]/10 to-transparent rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-gradient-to-tr from-[#06b6d4]/10 to-transparent rounded-full blur-3xl animation-delay-200 animate-pulse-soft" />
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10 py-8">
        {/* Left side - Branding */}
        <div className="hidden md:block space-y-6 animate-slide-in-up">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50">
              <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse-soft" />
              <span className="text-sm font-medium text-[#0a1628]">Sistem Antrian Digital</span>
            </div>

            <h1 className="text-display text-6xl font-bold text-[#0a1628] leading-tight">
              Silvana
            </h1>

            <div className="space-y-2">
              <p className="text-2xl text-[#2c4570] font-medium">Pelayanan Statistik Terpadu</p>
              <p className="text-lg text-[#64748b]">BPS Provinsi Kalimantan Utara</p>
            </div>
          </div>

          <div className="space-y-3 pt-6">
            <div className="flex items-start gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] flex items-center justify-center text-white font-bold text-lg transition-transform group-hover:scale-110">
                1
              </div>
              <div>
                <p className="font-semibold text-[#0a1628]">Daftar atau Login</p>
                <p className="text-sm text-[#64748b]">Masuk dengan akun Anda</p>
              </div>
            </div>

            <div className="flex items-start gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white font-bold text-lg transition-transform group-hover:scale-110">
                2
              </div>
              <div>
                <p className="font-semibold text-[#0a1628]">Buat Tiket Layanan</p>
                <p className="text-sm text-[#64748b]">Pilih jenis layanan yang Anda butuhkan</p>
              </div>
            </div>

            <div className="flex items-start gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4744a] to-[#b85d38] flex items-center justify-center text-white font-bold text-lg transition-transform group-hover:scale-110">
                3
              </div>
              <div>
                <p className="font-semibold text-[#0a1628]">Dapatkan Layanan</p>
                <p className="text-sm text-[#64748b]">Pantau antrian dan dapatkan pelayanan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="animate-slide-in-up animation-delay-200 w-full max-w-md mx-auto md:max-w-none flex flex-col">
          {/* Mobile branding */}
          <div className="md:hidden mb-8 text-center animate-slide-in-up animation-delay-300">
            <h1 className="text-display text-5xl font-bold text-[#0a1628] mb-1">Silvana</h1>
            <p className="text-sm text-[#64748b] leading-relaxed">
              Pelayanan Statistik Terpadu<br />
              <span className="font-medium">BPS Provinsi Kalimantan Utara</span>
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 shadow-deep">
            <div className="mb-6 sm:mb-8 text-center md:text-left">
              <h2 className="text-display text-2xl sm:text-3xl font-bold text-[#0a1628] mb-1 sm:mb-2">
                Selamat Datang
              </h2>
              <p className="text-sm sm:text-base text-[#64748b]">Masuk ke akun Anda untuk melanjutkan</p>
            </div>

            {isRegistered && !error && (
              <div className="mb-6 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
                Registrasi berhasil! Silakan masuk dengan akun Anda.
              </div>
            )}

            {error && (
              <div className="mb-6 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
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
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#d4744a] focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-[#0a1628]">
                  Password
                </label>
                <div className="relative group">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#d4744a] focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#d4744a] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-[#d4744a] focus:ring-[#d4744a] cursor-pointer"
                  />
                  <span className="text-[#64748b] group-hover:text-[#0a1628] transition-colors">
                    Ingat saya
                  </span>
                </label>
                <a
                  href="#"
                  className="text-[#d4744a] hover:text-[#b85d38] font-medium transition-colors"
                >
                  Lupa password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 sm:py-3.5 bg-gradient-to-r from-[#d4744a] to-[#b85d38] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-4 bg-white/50 backdrop-blur-sm text-[#64748b]">atau</span>
                </div>
              </div>

              <a
                href="/register"
                className="block w-full px-6 py-3 sm:py-3.5 bg-white/80 backdrop-blur-sm border-2 border-[#0a1628] text-[#0a1628] font-semibold rounded-lg hover:bg-[#0a1628] hover:text-white transition-all duration-300 text-center text-sm sm:text-base"
              >
                Daftar Akun Baru
              </a>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-[#fffbeb]/80 backdrop-blur-sm border border-[#fde68a] rounded-lg">
              <p className="text-[10px] sm:text-xs font-semibold text-[#92400e] mb-1.5 sm:mb-2 uppercase tracking-wider">Demo Credentials:</p>
              <div className="text-[10px] sm:text-xs text-[#92400e] space-y-1 font-mono">
                <p className="flex justify-between"><span>Admin:</span> <span className="font-normal">admin@silvana.bps.go.id  / admin123</span></p>
                <p className="flex justify-between"><span>Operator:</span> <span className="font-normal">operator@silvana.bps.go.id  / operator123</span></p>
                <p className="flex justify-between"><span>Pengunjung:</span> <span className="font-normal">pengunjung@silvana.bps.go.id  / pengunjung123</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto py-6 text-center text-[10px] sm:text-xs text-[#64748b] relative z-10">
        <p>&copy; 2026 BPS Provinsi Kalimantan Utara. All rights reserved.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
