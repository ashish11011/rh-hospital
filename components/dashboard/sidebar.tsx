"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  CalendarDays,
  UserCircle,
  HelpCircle,
  CreditCard,
  LogOut,
  IdCard,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "../ui/button";

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "RH ID Card",
    href: "/dashboard/id-card",
    icon: IdCard,
  },
  {
    title: "My Courses",
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
    <nav className="flex h-full w-full flex-col gap-2">
      <div className="flex flex-1 flex-col gap-2">
        {sidebarLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/dashboard" &&
              pathname.startsWith(`${link.href}/`));
          const Icon = link.icon;

          return (
            <Link
              key={link.title}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-primary/30 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="h-5 w-5" />
              {link.title}
            </Link>
          );
        })}
      </div>

      <div className="mt-8 border-t border-slate-200 pt-4 pb-6">
        <Button
          variant={"destructive"}
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex h-10 w-full gap-3"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </nav>
  );
}
