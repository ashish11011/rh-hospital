import { Badge } from "@/components/ui/badge";
import CourseCurriculum, { type CurriculumItem } from "./CourseCurriculum";

export interface CourseOverviewProps {
  courseOverview: string;
  whatYoullLearn: string[];
  skillsAcquired: string[];
  courseCurriculum: CurriculumItem[];
  courseId: string;
  coursePath: string;
  email: string;
  certificate?: {
    type: string;
    description: string;
  };
}

export default function CourseOverviewSection({
  courseOverview,
  courseId,
  coursePath,
  email,
  skillsAcquired,
  courseCurriculum,
  certificate,
}: CourseOverviewProps) {
  return (
    <section className="min-w-0 flex-1 py-10 lg:py-16">
      <div className="space-y-12">
        {/* <Button className=" h-12 px-4">Buy now</Button> */}
        {/* Overview */}
        <div>
          <h2 className="mb-5 text-xl font-semibold">Course Overview</h2>

          <div className="text-muted-foreground space-y-4 leading-7">
            <p>{courseOverview}</p>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-muted-foreground mb-5 text-sm font-semibold tracking-wide uppercase">
            Skills Acquired
          </h3>

          <div className="flex flex-wrap gap-3">
            {skillsAcquired.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="h-8 rounded-full px-4"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Curriculum */}
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-semibold">Course Curriculum</h3>
            <span className="text-muted-foreground text-sm">
              {courseCurriculum.length} learning{" "}
              {courseCurriculum.length === 1 ? "item" : "items"}
            </span>
          </div>

          <CourseCurriculum
            items={courseCurriculum}
            courseId={courseId}
            coursePath={coursePath}
            email={email}
          />
          {courseCurriculum.length === 0 && (
            <p className="text-muted-foreground mt-4 text-sm">
              Curriculum details will be available soon.
            </p>
          )}
        </div>

        {/* Certificate */}
        <div>
          <h3 className="mb-3 text-lg font-semibold">
            Earn a Verified Certificate
          </h3>

          <p className="text-muted-foreground mb-6 max-w-3xl">
            {certificate?.description ||
              "Validate your expertise with a professional certificate recognized by global healthcare institutions. Share it on LinkedIn or add it to your clinical portfolio."}
          </p>
        </div>
      </div>
    </section>
  );
}
