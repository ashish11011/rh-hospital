import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { adminLogoutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { getCurrentAdminAccess } from "@/lib/adminAuth";
import { LogOut } from "lucide-react";
import Link from "next/link";

export async function SidebarAdmin() {
  const { access } = await getCurrentAdminAccess();
  const projects = [
    {
      name: "Dashboard",
      url: "/admin",
      access: "full",
    },
    {
      name: "Users",
      url: "/admin/users",
      access: "full",
    },
    {
      name: "Workshops",
      url: "/admin/workshop",
      access: "full",
    },
    {
      name: "Courses",
      url: "/admin/course",
    },
    {
      name: "Course Enrolments",
      url: "/admin/course-enrolments",
    },
    {
      name: "Workshop Registrations",
      url: "/admin/workshop-registration",
      access: "full",
    },
    {
      name: "Seminar Registrations",
      url: "/admin/seminar-registration",
      access: "full",
    },
    {
      name: "Generate Certificate",
      url: "/admin/generate-certificate",
      access: "full",
    },
    {
      name: "Blog",
      url: "/admin/blog",
      access: "blog",
    },
  ].filter((project) => access === "full" || project.access === access);

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarMenu>
          {projects.map((project) => (
            <SidebarMenuItem key={project.name}>
              <SidebarMenuButton asChild>
                <Link href={project.url}>
                  <span>{project.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <form action={adminLogoutAction} className="w-full">
          <Button type="submit" variant="destructive" className="w-full gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
