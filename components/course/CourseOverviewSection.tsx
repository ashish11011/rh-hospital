import {
  Clock3,
  FileText,
  Presentation,
  Video,
  Headphones,
  Link2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface CourseOverviewProps {
  courseOverview: string;
  whatYoullLearn: string[];
  skillsAcquired: string[];
  courseCurriculum: {
    moduleNumber: number;
    lectureName: string;
    duration: string;
    mediaType: string;
  }[];
  certificate?: {
    type: string;
    description: string;
  };
}

export default function CourseOverviewSection({
  courseOverview,
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

          <ol className="divide-border bg-card divide-y overflow-hidden rounded-2xl border">
            {courseCurriculum.map((chapter) => {
              const media = getMediaPresentation(chapter.mediaType);
              const Icon = media.icon;
              return (
                <li
                  key={chapter.moduleNumber}
                  className="flex items-start gap-4 p-5 sm:items-center sm:p-6"
                >
                  <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                      {String(chapter.moduleNumber).padStart(2, "0")} ·{" "}
                      {media.label}
                    </p>
                    <h4 className="text-foreground text-base leading-6 font-medium break-words">
                      {chapter.lectureName}
                    </h4>
                    <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-sm">
                      <Clock3
                        className="size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>
                        <span className="sr-only">Duration: </span>
                        {chapter.duration}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
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

function getMediaPresentation(mediaType: string) {
  const type = mediaType.toLowerCase().trim();
  if (type.includes("pdf")) return { label: "PDF document", icon: FileText };
  if (/ppt|powerpoint|presentation/.test(type))
    return { label: "Presentation", icon: Presentation };
  if (/video|mp4|webm|mov|m4v/.test(type))
    return { label: "Video", icon: Video };
  if (/audio|mp3|wav/.test(type)) return { label: "Audio", icon: Headphones };
  if (type === "link") return { label: "Link", icon: Link2 };
  return { label: "Document", icon: FileText };
}
