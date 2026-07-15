import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function SidebarAdmin() {
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
      name: "Workshops",
      url: "/admin/workshop",
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
    },
    {
      name: "Seminar Registrations",
      url: "/admin/seminar-registration",
    },
    {
      name: "Generate Certificate",
      url: "/admin/generate-certificate",
    },
  ];
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
      <SidebarFooter />
    </Sidebar>
  );
}
