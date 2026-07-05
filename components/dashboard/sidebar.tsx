"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, GraduationCap, LayoutDashboard, CalendarDays, UserCircle, HelpCircle, CreditCard, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My course",
    href: "/dashboard/courses",
    icon: BookOpen,
  },
  {
    title: "Workshop",
    href: "/dashboard/workshops",
    icon: CalendarDays,
  },
  {
    title: "Certificates",
    href: "/dashboard/certificates",
    icon: GraduationCap,
  },
  {
    title: "Orders and payments",
    href: "/dashboard/orders",
    icon: CreditCard,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: UserCircle,
  },
  {
    title: "Support",
    href: "/dashboard/support",
    icon: HelpCircle,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 w-full h-full">
      <div className="flex-1 flex flex-col gap-2">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link
              key={link.title}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="w-5 h-5" />
              {link.title}
            </Link>
          );
        })}
      </div>
      
      <div className="mt-8 pt-4 border-t border-slate-200">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </nav>
  );
}
