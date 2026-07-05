import { CheckCircle2, Clock3, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface CourseOverviewProps {
  courseOverview: string;
  whatYoullLearn: string[];
  skillsAcquired: string[];
  courseCurriculum: {
    moduleNumber: number;
    lectureName: string;
    duration: string;
    subTopics: string;
    pdfFileName?: string;
  }[];
  certificate?: {
    type: string;
    description: string;
  };
}

export default function CourseOverviewSection({
  courseOverview,
  whatYoullLearn,
  skillsAcquired,
  courseCurriculum,
  certificate,
}: CourseOverviewProps) {
  return (
    <section className="py-16">
      <div className="space-y-12">
        {/* <Button className=" h-12 px-4">Buy now</Button> */}
        {/* Overview */}
        <div>
          <h2 className="mb-5 text-xl font-semibold">Course Overview</h2>

          <div className="text-muted-foreground space-y-4 leading-7">
            <p>{courseOverview}</p>
          </div>
        </div>

        {/* Learn */}
        <div className="bg-muted/20 rounded-2xl border p-8">
          <h3 className="mb-6 font-semibold">What you'll learn</h3>

          <div className="grid gap-4 md:grid-cols-2">
            {whatYoullLearn.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <p className="text-muted-foreground text-sm">{item}</p>
              </div>
            ))}
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
          <h3 className="mb-6 text-xl font-semibold">Course Curriculum</h3>

          <Accordion type="multiple" className="w-full space-y-4">
            {courseCurriculum.map((chapter) => (
              <AccordionItem
                key={chapter.moduleNumber}
                value={String(chapter.moduleNumber)}
                className="bg-card border-border data-[state=open]:border-primary/20 overflow-hidden rounded-2xl border transition-colors"
              >
                <AccordionTrigger className="flex w-full items-center justify-between p-6 text-left hover:no-underline">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold">
                      {String(chapter.moduleNumber).padStart(2, "0")}
                    </div>
                    <h4 className="text-base font-medium">
                      {chapter.lectureName}
                    </h4>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="border-t px-6 pt-0">
                  <div className="text-muted-foreground flex flex-col gap-2 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <Clock3 className="h-4 w-4" />
                      <span className="text-foreground font-medium">
                        Duration:
                      </span>{" "}
                      {chapter.duration}
                    </div>
                    <div className="mt-2 flex items-start gap-3">
                      <FileText className="mt-0.5 h-4 w-4" />
                      <div>
                        <span className="text-foreground font-medium">
                          Topics:
                        </span>{" "}
                        {chapter.subTopics}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
