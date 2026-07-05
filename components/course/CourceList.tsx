"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Award,
  Clock,
  GraduationCap,
  ArrowRight,
  SearchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { COURSE_DATA } from "@/const/courceData";
import Link from "next/link";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

export default function CourseList() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = COURSE_DATA.filter(
    (course) =>
      course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseOverview.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex w-full flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
          <p className="text-muted-foreground text-sm">
            Showing{" "}
            <span className="font-semibold">{filteredCourses.length}</span>{" "}
            Courses
          </p>
          <InputGroup className="max-w-72">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search Courses"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card
              key={course.slug}
              className="overflow-hidden rounded-2xl border py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Link href={course.slug}>
                <div className="relative h-52">
                  <Image
                    src={course.bannerImage}
                    alt={course.name}
                    height={500}
                    width={500}
                    className="h-auto w-full object-cover"
                  />

                  {/* <span
                                    className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium text-white ${course.color}`}
                                >
                                    {course.category}
                                </span> */}
                </div>

                <CardContent className="space-y-2 p-5">
                  <div>
                    <h3 className="line-clamp-2 text-2xl leading-tight font-bold">
                      {course.courseTitle}
                    </h3>

                    <p className="text-muted-foreground mt-3 line-clamp-2 text-sm">
                      {course.courseOverview}
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

                  <div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-3 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {course.courseHour}
                    </div>

                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {course.numberOfLacture}
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
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
