import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cloudfrontAssetUrl } from "@/lib/cloudfront";
import { fetchMobileApi } from "@/lib/serverMobileApi";
import { Clock, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type CoursesApiResponse = {
  success: boolean;
  courses: {
    enrolmentId: string;
    status: string;
    enrolledAt: string | Date | null;
    courseId: string;
    title: string;
    description: string;
    bannerImageUrl: string;
    slug: string;
    courseHours: number;
    courseDuration: string | null;
    totalLectures: number;
  }[];
};

export default async function MyCoursesPage() {
  const { courses } = await fetchMobileApi<CoursesApiResponse>("/api/auth/mobile/courses");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My Courses
        </h1>
        <p className="text-slate-500 mt-1">
          Access and resume all your enrolled courses.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-20 text-center">
          <p className="text-slate-500">You haven't enrolled in any courses yet.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.enrolmentId} className="overflow-hidden py-0">
              <div className="relative h-40">
                <Image
                  src={cloudfrontAssetUrl(course.bannerImageUrl)}
                  alt={course.title}
                  width={500}
                  height={300}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="space-y-4 p-5">
                <div>
                  <h2 className="line-clamp-2 text-lg font-semibold text-slate-900">
                    {course.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {course.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {course.courseDuration || `${course.courseHours} hours`}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4" />
                    {course.totalLectures} lessons
                  </span>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/dashboard/courses/${course.courseId}`}>Open course</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
