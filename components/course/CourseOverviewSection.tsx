"use client";

import { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Clock3,
    FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const learnItems = [
    "Master 12-lead ECG analysis using a systematic clinical approach.",
    "Identify complex blocks and hemiblocks with surgical precision.",
    "Differentiate between SVT and VT in hemodynamically unstable patients.",
    "Analyze ST-segment deviations for precise infarct localization.",
    "Recognize non-cardiac causes of ECG changes.",
    "Develop management protocols for acute coronary syndromes.",
];

const skills = [
    "ECG Reading",
    "Clinical Diagnosis",
    "Cardiology",
    "Patient Care",
    "Emergency Medicine",
];

const curriculum = [
    {
        id: "01",
        title: "Fundamentals of Electrophysiology",
        lessons: [
            {
                title: "Ion Channels and Action Potentials",
                duration: "15:00",
            },
            {
                title: "Reading Material: The Vector Physics",
                duration: "10 pages",
            },
        ],
    },
    {
        id: "02",
        title: "Ischemic Heart Disease",
        lessons: [
            {
                title: "ECG Changes in Myocardial Infarction",
                duration: "20:00",
            },
            {
                title: "Clinical Case Discussion",
                duration: "12:00",
            },
        ],
    },
    {
        id: "03",
        title: "Arrhythmia Management",
        lessons: [
            {
                title: "Managing Bradycardia",
                duration: "18:00",
            },
            {
                title: "Managing Tachycardia",
                duration: "22:00",
            },
        ],
    },
];

export default function CourseOverviewSection() {
    const [open, setOpen] = useState(0);

    return (
        <section className="py-16">
            <div className=" space-y-12">
                {/* <Button className=" h-12 px-4">Buy now</Button> */}
                {/* Overview */}
                <div>
                    <h2 className="mb-5 text-xl font-semibold">Course Overview</h2>

                    <div className="space-y-4 text-muted-foreground leading-7">
                        <p>
                            This advanced program is meticulously designed for healthcare
                            professionals seeking to master the complexities of
                            electrocardiography. We move beyond simple pattern recognition into
                            the underlying electrophysiology and clinical pathophysiology of
                            cardiac conditions.
                        </p>

                        <p>
                            By the end of this course, you will possess the diagnostic
                            confidence to identify subtle ischemic changes, complex
                            arrhythmias, and electrolyte disturbances that are often missed in
                            routine practice. Our curriculum bridges the gap between academic
                            theory and high-stakes clinical decision-making.
                        </p>
                    </div>
                </div>

                {/* Learn */}
                <div className="rounded-2xl border bg-muted/20 p-8">
                    <h3 className="mb-6 font-semibold">What you'll learn</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        {learnItems.map((item) => (
                            <div key={item} className="flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600 shrink-0" />
                                <p className="text-sm text-muted-foreground">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                <div>
                    <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Skills Acquired
                    </h3>

                    <div className="flex flex-wrap gap-3">
                        {skills.map((skill) => (
                            <Badge
                                key={skill}
                                variant="outline"
                                className="rounded-full h-8 px-4"
                            >
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Curriculum */}
                <div>
                    <h3 className="mb-6 text-xl font-semibold">Course Curriculum</h3>

                    <div className="space-y-4">
                        {curriculum.map((chapter, index) => {
                            const isOpen = open === index;

                            return (
                                <div
                                    key={chapter.id}
                                    className="overflow-hidden rounded-2xl border"
                                >
                                    <button
                                        onClick={() => setOpen(isOpen ? -1 : index)}
                                        className="flex w-full items-center justify-between p-6 text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                                                {chapter.id}
                                            </div>

                                            <h4 className="font-medium">{chapter.title}</h4>
                                        </div>

                                        {isOpen ? (
                                            <ChevronUp className="h-5 w-5" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5" />
                                        )}
                                    </button>

                                    {isOpen && (
                                        <div className="border-t px-6 pb-6">
                                            {chapter.lessons.map((lesson) => (
                                                <div
                                                    key={lesson.title}
                                                    className="flex items-center justify-between py-4 text-sm"
                                                >
                                                    <div className="flex items-center gap-3 text-muted-foreground">
                                                        {lesson.duration.includes("pages") ? (
                                                            <FileText className="h-4 w-4" />
                                                        ) : (
                                                            <Clock3 className="h-4 w-4" />
                                                        )}

                                                        {lesson.title}
                                                    </div>

                                                    <span className="text-muted-foreground">
                                                        {lesson.duration}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Certificate */}
                <div>
                    <h3 className="mb-3 text-lg font-semibold">
                        Earn a Verified Certificate
                    </h3>

                    <p className="mb-6 max-w-3xl text-muted-foreground">
                        Validate your expertise with a professional certificate recognized
                        by global healthcare institutions. Share it on LinkedIn or add it to
                        your clinical portfolio.
                    </p>


                </div>
            </div>
        </section>
    );
}