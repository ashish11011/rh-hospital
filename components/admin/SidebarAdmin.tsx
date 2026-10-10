import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { adminLogoutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { getCurrentAdminAccess } from "@/lib/adminAuth";
import { LogOut } from "lucide-react";
import { AdminSidebarMenu } from "@/components/admin/AdminSidebarMenu";

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
      name: "RH Card",
      url: "/admin/rh-card",
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
      name: "Course Reviews",
      url: "/admin/course-reviews",
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
      name: "Contact Enquiries",
      url: "/admin/contact-enquiries",
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
        <AdminSidebarMenu items={projects} />
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
