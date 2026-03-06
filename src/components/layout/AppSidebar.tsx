"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import LogoutButton from "@/components/layout/LogoutButton";
import { 
  LayoutDashboard, 
  Ticket, 
  WalletCards, 
  CalendarDays, 
  User, 
  Clock, 
  History, 
  CalendarCheck,
  Users,
  ShieldCheck,
  ClipboardList,
  MessageSquare
} from "lucide-react";

type UserRole = "ADMIN" | "OPERATOR" | "VISITOR";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface AppSidebarProps {
  userName: string;
  role: UserRole;
}

const MENU_CONFIG: Record<UserRole, NavItem[]> = {
  ADMIN: [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Kelola Pengguna",
      href: "/admin/users",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Kelola Operator",
      href: "/admin/operators",
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      label: "Jadwal Operator",
      href: "/admin/schedules",
      icon: <CalendarDays className="w-5 h-5" />,
    },
    {
      label: "Semua Tiket",
      href: "/admin/tickets",
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      label: "Feedback",
      href: "/admin/feedback",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      label: "Profil Saya",
      href: "/admin/profile",
      icon: <User className="w-5 h-5" />,
    },
  ],
  OPERATOR: [
    {
      label: "Dashboard",
      href: "/operator/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Proses Antrian",
      href: "/operator/queue",
      icon: <Clock className="w-5 h-5" />,
    },
    {
      label: "Riwayat Layanan",
      href: "/operator/tickets",
      icon: <History className="w-5 h-5" />,
    },
    {
      label: "Jadwal Reservasi",
      href: "/operator/reservations",
      icon: <CalendarDays className="w-5 h-5" />,
    },
    {
      label: "Jadwal Saya",
      href: "/operator/schedule",
      icon: <CalendarCheck className="w-5 h-5" />,
    },
    {
      label: "Profil Saya",
      href: "/operator/profile",
      icon: <User className="w-5 h-5" />,
    },
  ],
  VISITOR: [
    {
      label: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Tiket Saya",
      href: "/tickets",
      icon: <Ticket className="w-5 h-5" />,
    },
    {
      label: "Profil Saya",
      href: "/profile",
      icon: <User className="w-5 h-5" />,
    },
    {
      label: "Buat Tiket",
      href: "/tickets/new",
      icon: <WalletCards className="w-5 h-5" />,
    },
    {
      label: "Jadwal Layanan",
      href: "/schedule",
      icon: <CalendarDays className="w-5 h-5" />,
    },
  ],
};

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  OPERATOR: "Operator Bertugas",
  VISITOR: "Pengunjung",
};

const ROLE_SUBTITLE: Record<UserRole, string> = {
  ADMIN: "Panel Administrator",
  OPERATOR: "Panel Operator",
  VISITOR: "Pelayanan Statistik Terpadu",
};

export default function AppSidebar({ userName, role }: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = MENU_CONFIG[role] || [];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#0a1628] to-[#1a2942] text-white w-72">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <Image
              src="/image/bps.png"
              alt="Logo BPS"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-display text-xl font-bold">Silvana</h1>
            <p className="text-xs text-white/50">{ROLE_SUBTITLE[role]}</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <div className="flex items-center gap-1.5">
              {role !== "VISITOR" && <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse-soft" />}
              <p className="text-xs text-white/50">{ROLE_LABELS[role]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0">
        <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-3 mb-2">
          Menu Utama
        </p>
        {navItems.map((item) => {
          const isActive = role === "VISITOR" && item.href === "/" 
            ? pathname === "/" 
            : pathname === item.href || pathname.startsWith(item.href + "/");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <LogoutButton />
      </div>
    </div>
  );
}
