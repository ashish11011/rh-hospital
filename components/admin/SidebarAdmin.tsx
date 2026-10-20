import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { adminLogoutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { getCurrentAdminAccess } from "@/lib/adminAuth";
import { canAccessAdminPath } from "@/lib/adminAccess";
import { LogOut } from "lucide-react";
import { AdminSidebarMenu } from "@/components/admin/AdminSidebarMenu";

export async function SidebarAdmin() {
  const { access } = await getCurrentAdminAccess();
  const projects = [
    {
      name: "Dashboard",
      url: "/admin",
    },
    {
      name: "Users",
      url: "/admin/users",
    },
    {
      name: "Payments",
      url: "/admin/payments",
    },
    {
      name: "RH Membership Card",
      url: "/admin/rh-card",
    },
    {
      name: "Workshops",
      url: "/admin/workshop",
    },
    {
      name: "Workshop Registrations",
      url: "/admin/workshop-registration",
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
      name: "Seminar Registrations",
      url: "/admin/seminar-registration",
    },
    {
      name: "Contact Enquiries",
      url: "/admin/contact-enquiries",
    },
    {
      name: "Generate Certificate",
      url: "/admin/generate-certificate",
    },
    {
      name: "Blog",
      url: "/admin/blog",
    },
  ].filter(
    (project) => access !== null && canAccessAdminPath(project.url, access),
  );

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
