"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Save, Lock, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const PROFESSION_OPTIONS = [
  { value: "GOVERNMENT_OFFICIAL", label: "ASN / Pegawai Pemerintah" },
  { value: "PRIVATE_EMPLOYEE", label: "Pegawai Swasta" },
  { value: "ENTREPRENEUR", label: "Wirausaha" },
  { value: "RESEARCHER", label: "Peneliti / Akademisi" },
  { value: "STUDENT", label: "Mahasiswa / Pelajar" },
  { value: "OTHERS", label: "Lainnya" },
];

const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  professionType: z.string(),
  nik: z.string().length(16, "NIK harus 16 digit"),
  phoneNumber: z.string().min(10, "Nomor HP minimal 10 digit"),
  instansi: z.string().optional().or(z.literal("")),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini diperlukan"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
  confirmPassword: z.string().min(1, "Konfirmasi password diperlukan"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

type ProfileInput = z.infer<typeof profileSchema>;
type PasswordInput = z.infer<typeof passwordSchema>;

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    professionType: string;
    nik: string | null;
    phoneNumber: string | null;
    instansi: string | null;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      professionType: user.professionType,
      nik: user.nik || "",
      phoneNumber: user.phoneNumber || "",
      instansi: user.instansi || "",
    },
  });

  const {
    register: registerPass,
    handleSubmit: handleSubmitPass,
    reset: resetPass,
    formState: { errors: errorsPass },
  } = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileInput) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Gagal memperbarui profil");
      }

      toast.success("Profil berhasil diperbarui!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordInput) => {
    setIsPasswordLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Gagal mengubah password");
      }

      toast.success("Password berhasil diubah!");
      resetPass();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-slide-in-up">
      {/* Identity Section */}
      <section className="glass rounded-3xl overflow-hidden shadow-card border border-white/20">
        <div className="bg-gradient-to-r from-[#d4744a] to-[#b85d38] p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Informasi Pribadi</h2>
              <p className="text-white/70 text-sm italic">Kelola data identitas Anda untuk kemudahan layanan</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onProfileSubmit)} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Nama Lengkap</label>
              <input
                {...register("name")}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#d4744a]/10 focus:border-[#d4744a] transition-all ${errors.name ? "border-red-500" : "border-slate-100"}`}
                placeholder="Nama Anda"
              />
              {errors.name && <p className="text-red-500 text-xs ml-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
              <input
                {...register("email")}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#d4744a]/10 focus:border-[#d4744a] transition-all ${errors.email ? "border-red-500" : "border-slate-100"}`}
                placeholder="email@anda.com"
              />
              {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>}
            </div>

            {/* NIK */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">NIK (16 Digit)</label>
              <input
                {...register("nik")}
                maxLength={16}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#d4744a]/10 focus:border-[#d4744a] transition-all ${errors.nik ? "border-red-500" : "border-slate-100"}`}
                placeholder="16 digit NIK"
              />
              {errors.nik && <p className="text-red-500 text-xs ml-1">{errors.nik.message}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">No. WhatsApp / HP</label>
              <input
                {...register("phoneNumber")}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#d4744a]/10 focus:border-[#d4744a] transition-all ${errors.phoneNumber ? "border-red-500" : "border-slate-100"}`}
                placeholder="08xxxxxxxxxx"
              />
              {errors.phoneNumber && <p className="text-red-500 text-xs ml-1">{errors.phoneNumber.message}</p>}
            </div>

            {/* Profession */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Pekerjaan</label>
              <select
                {...register("professionType")}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#d4744a]/10 focus:border-[#d4744a] transition-all text-slate-700 ${errors.professionType ? "border-red-500" : "border-slate-100"}`}
              >
                {PROFESSION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.professionType && <p className="text-red-500 text-xs ml-1">{errors.professionType.message}</p>}
            </div>

            {/* Instansi */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Instansi / Perusahaan</label>
              <input
                {...register("instansi")}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#d4744a]/10 focus:border-[#d4744a] transition-all ${errors.instansi ? "border-red-500" : "border-slate-100"}`}
                placeholder="Nama Kantor/Kampus"
              />
              {errors.instansi && <p className="text-red-500 text-xs ml-1">{errors.instansi.message}</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3.5 bg-gradient-to-r from-[#d4744a] to-[#b85d38] text-white rounded-2xl font-bold shadow-lg shadow-[#d4744a]/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Password Section */}
      <section className="glass rounded-3xl overflow-hidden shadow-card border border-white/20">
        <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Keamanan Akun</h2>
              <p className="text-white/50 text-sm">Ganti password secara berkala untuk menjaga keamanan akun Anda</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmitPass(onPasswordSubmit)} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Password */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Password Saat Ini</label>
              <div className="relative">
                <input
                  {...registerPass("currentPassword")}
                  type={showCurrentPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-400/10 focus:border-slate-400 transition-all ${errorsPass.currentPassword ? "border-red-500" : "border-slate-100"}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errorsPass.currentPassword && <p className="text-red-500 text-xs ml-1">{errorsPass.currentPassword.message}</p>}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Password Baru</label>
              <div className="relative">
                <input
                  {...registerPass("newPassword")}
                  type={showNewPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-400/10 focus:border-slate-400 transition-all ${errorsPass.newPassword ? "border-red-500" : "border-slate-100"}`}
                  placeholder="Min 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errorsPass.newPassword && <p className="text-red-500 text-xs ml-1">{errorsPass.newPassword.message}</p>}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Konfirmasi Password Baru</label>
              <div className="relative">
                <input
                  {...registerPass("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-400/10 focus:border-slate-400 transition-all ${errorsPass.confirmPassword ? "border-red-500" : "border-slate-100"}`}
                  placeholder="Ulangi password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errorsPass.confirmPassword && <p className="text-red-500 text-xs ml-1">{errorsPass.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isPasswordLoading}
              className="px-8 py-3.5 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 shadow-lg shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isPasswordLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengubah...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Ganti Password
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
