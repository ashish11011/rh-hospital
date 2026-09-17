import { getAdminCourses } from "@/actions/courseAdminActions";
import { CourseListClient } from "@/components/admin/CourseListClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin - Course Management" };

export default async function AdminCoursePage() {
  return <CourseListClient courses={await getAdminCourses()} />;
}
