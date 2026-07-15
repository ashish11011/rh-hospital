import { getCourseEnrolments } from "@/actions/courseAdminActions";
import { CourseEnrolmentsClient } from "@/components/admin/CourseEnrolmentsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin - Course Enrolments" };

export default async function CourseEnrolmentsPage() {
  return <CourseEnrolmentsClient enrolments={await getCourseEnrolments()} />;
}
