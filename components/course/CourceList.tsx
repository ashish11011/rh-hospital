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
import Link from "next/link";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { publicAssetUrl } from "@/lib/publicAsset";
import { publicCoursePath } from "@/lib/course";
import { getRhCardCoursePricing } from "@/lib/rhCardDiscount";
import { CoursePrice } from "./CoursePrice";

type CourseListItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string | null;
  bannerImageUrl: string;
  courseHours: number;
  courseDuration: string | null;
  totalLectures: number;
  slug: string;
  courseOverview: string | null;
  skillsAcquired: string[] | null;
};

export default function CourseList({
  courses,
  rhCardDiscountEligible = false,
}: {
  courses: CourseListItem[];
  rhCardDiscountEligible?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.courseOverview || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
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
          {filteredCourses.map((course) => {
            const pricing = getRhCardCoursePricing(
              course.price,
              rhCardDiscountEligible,
            );
            return (
              <Card
                key={course.id}
                className="overflow-hidden rounded-2xl border py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-52">
                  <Link href={publicCoursePath(course.slug)}>
                    <Image
                      src={publicAssetUrl(course.bannerImageUrl)}
                      alt={course.title}
                      height={500}
                      width={500}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                </div>

                <CardContent className="space-y-2 p-5">
                  <Link href={publicCoursePath(course.slug)}>
                    <div>
                      <h3 className="line-clamp-2 text-2xl leading-tight font-bold">
                        {course.title}
                      </h3>

                      <p className="text-muted-foreground mt-3 line-clamp-2 text-sm">
                        {course.courseOverview || course.description}
                      </p>
                    </div>
                  </Link>

                  <div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-3 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {course.courseDuration || `${course.courseHours} hours`}
                    </div>

                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {course.totalLectures} lectures
                    </div>

                    {course.skillsAcquired &&
                      course.skillsAcquired.length > 0 && (
                        <div className="flex items-center gap-2 text-green-600">
                          <Award className="h-4 w-4 fill-current" />
                          Certificate
                        </div>
                      )}
                  </div>

                  <CoursePrice
                    pricing={pricing}
                    currency={course.currency || "INR"}
                  />
                  <Button className="w-full rounded-xl" asChild>
                    <Link href={publicCoursePath(course.slug)}>
                      {course.price > 0
                        ? `Enroll for ${course.currency || "INR"} ${pricing.amount}`
                        : "Enroll Now"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-muted-foreground rounded-xl border border-dashed p-10 text-center">
            No courses found.
          </div>
        )}
      </div>
    </section>
  );
}
