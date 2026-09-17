import { getAdminCourseReviews } from "@/actions/courseAdminActions";
import { CourseReviewsClient } from "@/components/admin/CourseReviewsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin - Course Reviews" };

export default async function AdminCourseReviewsPage() {
  return <CourseReviewsClient reviews={await getAdminCourseReviews()} />;
}
