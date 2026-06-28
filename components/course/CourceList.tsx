import Image from "next/image";
import { Award, Clock, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { courses } from "@/const/courceData";
import Link from "next/link";


export default function CourseList() {
    return (
        <section className=" py-12  md:py-20">
            <div className="container mx-auto px-4">
                <p className="mb-8 text-sm text-muted-foreground">
                    Showing <span className="font-semibold">{courses.length}</span>{" "}
                    Courses
                </p>

                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {courses.map((course) => (
                        <Card
                            key={course.id}
                            className="overflow-hidden border rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl py-0"
                        >
                            <div className="relative h-52">
                                <Image
                                    src={course.image}
                                    alt={course.title}
                                    fill
                                    className="object-cover"
                                />

                                {/* <span
                                    className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium text-white ${course.color}`}
                                >
                                    {course.category}
                                </span> */}
                            </div>

                            <CardContent className="space-y-5 p-5">
                                <div>
                                    <h3 className="line-clamp-2 text-2xl font-bold leading-tight">
                                        {course.title}
                                    </h3>

                                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                                        {course.description}
                                    </p>
                                </div>

                                {/* <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>
                                            {course.instructor
                                                .split(" ")
                                                .map((i) => i[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <p className="text-sm font-semibold">
                                            {course.instructor}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {course.designation}
                                        </p>
                                    </div>
                                </div> */}

                                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {course.duration}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4" />
                                        {course.level}
                                    </div>

                                    {course.certificate && (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <Award className="h-4 w-4 fill-current" />
                                            Certificate
                                        </div>
                                    )}
                                </div>

                                <Link href={"/courses/123"}>
                                    <Button className="w-full rounded-xl">
                                        Enroll Now
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}