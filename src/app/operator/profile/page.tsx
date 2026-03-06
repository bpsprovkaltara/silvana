import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/profile/ProfileForm";

export default async function OperatorProfilePage() {
  const session = await auth();
  if (!session || session.user.role !== "OPERATOR") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      professionType: true,
      nik: true,
      phoneNumber: true,
      instansi: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-display text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0a1628] to-[#1a2942]">
          Profil Saya
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Kelola informasi akun dan pengaturan keamanan operator
        </p>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}
