import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MobileSidebarToggle from "@/components/layout/MobileSidebarToggle";
import AppSidebar from "@/components/layout/AppSidebar";

export default async function OperatorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "OPERATOR") redirect("/login");

  const userName = session.user.name || "Operator";

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 min-h-screen shrink-0">
        <div className="fixed w-72 h-full">
          <AppSidebar userName={userName} role="OPERATOR" />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <MobileSidebarToggle>
        <AppSidebar userName={userName} role="OPERATOR" />
      </MobileSidebarToggle>

      {/* Main content */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
