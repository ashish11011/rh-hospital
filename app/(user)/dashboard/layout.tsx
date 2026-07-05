import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Mobile Navigation Drawer */}
        <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm md:hidden">
          <h2 className="font-semibold text-slate-800">Dashboard Menu</h2>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 pt-12">
              <div className="h-full overflow-y-auto px-4">
                <DashboardSidebar />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          <aside className="hidden w-full flex-shrink-0 md:block md:w-64">
            <DashboardSidebar />
          </aside>
          <main className="min-h-[60vh] w-full flex-1 rounded-2xl shadow-sm md:border md:border-slate-100 md:bg-white md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
