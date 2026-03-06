"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validations";
import { z } from "zod";

type RegisterInput = z.infer<typeof registerSchema> & { confirmPassword: string };

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
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(
      registerSchema.extend({
        confirmPassword: z.string(),
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Konfirmasi password tidak sesuai",
        path: ["confirmPassword"],
      })
    ),
  });

  const onSubmit = async (values: RegisterInput) => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-gradient-to-br from-[#06b6d4]/10 to-transparent rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-gradient-to-tr from-[#d4744a]/10 to-transparent rounded-full blur-3xl animation-delay-200 animate-pulse-soft" />
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10 py-8">
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
        <div className="animate-slide-in-up animation-delay-200 w-full max-w-lg mx-auto md:max-w-none flex flex-col">
          {/* Mobile branding */}
          <div className="md:hidden mb-8 text-center animate-slide-in-up animation-delay-300">
            <h1 className="text-display text-5xl font-bold text-[#0a1628] mb-1">Silvana</h1>
            <p className="text-sm text-[#64748b] leading-relaxed">
              Pelayanan Statistik Terpadu<br />
              <span className="font-medium">BPS Provinsi Kalimantan Utara</span>
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 shadow-deep">
            <div className="mb-6 text-center md:text-left">
              <h2 className="text-display text-2xl sm:text-3xl font-bold text-[#0a1628] mb-1">Daftar Akun</h2>
              <p className="text-sm sm:text-base text-[#64748b]">Buat akun baru untuk mengakses layanan</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-sm font-semibold text-[#0a1628]">
                    Nama Lengkap
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    {...register("name")}
                    className={`w-full px-4 py-3 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent transition-all placeholder:text-slate-400 ${errors.name ? "border-red-500" : "border-slate-200"}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="nik" className="block text-sm font-semibold text-[#0a1628]">
                    NIK (16 Digit)
                  </label>
                  <input
                    id="nik"
                    type="text"
                    maxLength={16}
                    placeholder="16 digit NIK"
                    {...register("nik")}
                    className={`w-full px-4 py-3 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent transition-all placeholder:text-slate-400 ${errors.nik ? "border-red-500" : "border-slate-200"}`}
                  />
                  {errors.nik && <p className="text-red-500 text-xs mt-1">{errors.nik.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-semibold text-[#0a1628]">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    {...register("email")}
                    className={`w-full px-4 py-3 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent transition-all placeholder:text-slate-400 ${errors.email ? "border-red-500" : "border-slate-200"}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="phoneNumber" className="block text-sm font-semibold text-[#0a1628]">
                    No. WhatsApp / HP
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    {...register("phoneNumber")}
                    className={`w-full px-4 py-3 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent transition-all placeholder:text-slate-400 ${errors.phoneNumber ? "border-red-500" : "border-slate-200"}`}
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="profession" className="block text-sm font-semibold text-[#0a1628]">
                    Jenis Pekerjaan
                  </label>
                  <select
                    id="profession"
                    defaultValue=""
                    {...register("professionType")}
                    className={`w-full px-4 py-3 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent transition-all text-slate-700 ${errors.professionType ? "border-red-500" : "border-slate-200"}`}
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
                  {errors.professionType && <p className="text-red-500 text-xs mt-1">{errors.professionType.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="instansi" className="block text-sm font-semibold text-[#0a1628]">
                    Instansi / Perusahaan
                  </label>
                  <input
                    id="instansi"
                    type="text"
                    placeholder="Nama Kantor/Kampus"
                    {...register("instansi")}
                    className={`w-full px-4 py-3 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent transition-all placeholder:text-slate-400 ${errors.instansi ? "border-red-500" : "border-slate-200"}`}
                  />
                  {errors.instansi && <p className="text-red-500 text-xs mt-1">{errors.instansi.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-sm font-semibold text-[#0a1628]">
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 karakter"
                      {...register("password")}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent transition-all placeholder:text-slate-400 ${errors.password ? "border-red-500" : "border-slate-200"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#06b6d4] transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-[#0a1628]"
                  >
                    Konfirmasi
                  </label>
                  <div className="relative group">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Ulangi password"
                      {...register("confirmPassword")}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent transition-all placeholder:text-slate-400 ${errors.confirmPassword ? "border-red-500" : "border-slate-200"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#06b6d4] transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 sm:py-3.5 bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? "Memproses..." : "Daftar Sekarang"}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-4 bg-white/50 backdrop-blur-sm text-[#64748b]">
                    sudah punya akun?
                  </span>
                </div>
              </div>

              <a
                href="/login"
                className="block w-full px-6 py-3 sm:py-3.5 bg-white/80 backdrop-blur-sm border-2 border-[#0a1628] text-[#0a1628] font-semibold rounded-lg hover:bg-[#0a1628] hover:text-white transition-all duration-300 text-center text-sm sm:text-base"
              >
                Masuk ke Akun
              </a>
            </form>
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
