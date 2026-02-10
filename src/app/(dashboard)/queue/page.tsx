import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TicketCard from "@/components/queue/TicketCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default async function QueuePage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Find active ticket for today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const activeTicket = await prisma.ticket.findFirst({
    where: {
      userId: session.user.id,
      createdAt: { gte: startOfDay },
      status: { in: ["PENDING", "ON_PROCESS"] },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container max-w-lg mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Antrean Saya</h1>

      {activeTicket ? (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <TicketCard initialTicket={activeTicket as unknown as any} />
      ) : (
        <div className="text-center py-12 space-y-4">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Belum Ada Tiket</h2>
          <p className="text-slate-500 max-w-xs mx-auto">
            Anda belum mengambil tiket antrean untuk hari ini. Silakan ambil tiket baru.
          </p>
          <Button asChild className="mt-4" size="lg">
            <Link href="/tickets/new">Ambil Tiket Baru</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
