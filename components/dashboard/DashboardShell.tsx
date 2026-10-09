"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  GraduationCap,
} from "lucide-react";
import { DashboardSidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLesson = /^\/dashboard\/courses\/[^/]+\/?$/.test(pathname);
  const [navigation, setNavigation] = useState<{
    path: string;
    open: boolean;
  } | null>(null);
  const sidebarOpen =
    navigation?.path === pathname ? navigation.open : !isLesson;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div
        className={`mx-auto w-full px-4 py-5 sm:px-6 lg:px-8 ${isLesson ? "max-w-[1920px]" : "max-w-[1600px]"}`}
      >
        <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4">
          <Button
            variant="outline"
            size="sm"
            className="hidden bg-white md:inline-flex"
            aria-expanded={sidebarOpen}
            aria-controls="dashboard-navigation"
            onClick={() =>
              setNavigation({ path: pathname, open: !sidebarOpen })
            }
          >
            {sidebarOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
            {sidebarOpen ? "Hide navigation" : "Show navigation"}
          </Button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white md:hidden"
              >
                <Menu className="size-4" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 px-4 pt-6">
              <SheetTitle>My dashboard</SheetTitle>
              <SheetDescription>
                Courses, workshops and your account.
              </SheetDescription>
              <div
                className="overflow-y-auto"
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest("a"))
                    setMobileOpen(false);
                }}
              >
                <DashboardSidebar />
              </div>
            </SheetContent>
          </Sheet>
          <span className="h-5 w-px bg-slate-200" aria-hidden="true" />
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <GraduationCap className="text-primary size-4" />
            {isLesson ? "Learning space" : "My dashboard"}
          </div>
        </div>
        <div className="flex items-start gap-6 lg:gap-8">
          <aside
            id="dashboard-navigation"
            className={`${sidebarOpen ? "md:block" : ""} sticky top-24 hidden w-56 shrink-0`}
          >
            <DashboardSidebar />
          </aside>
          <main
            className={`mx-auto min-h-[60vh] max-w-5xl min-w-0 flex-1 ${isLesson ? "" : "rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:p-6 lg:p-8"}`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
