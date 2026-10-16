import CourseList from "@/components/course/CourceList";
import {
  getCurrentCourseUser,
  getPublicCourses,
} from "@/actions/courseActions";
import { getRhCardDiscountCard } from "@/lib/rhCardMembership";
import React from "react";
import Link from "next/link";

const page = async () => {
  const [courses, currentUser] = await Promise.all([
    getPublicCourses(),
    getCurrentCourseUser(),
  ]);
  const discountCard = await getRhCardDiscountCard(currentUser?.id);

  return (
    <div>
      <HeroSection />
      <CourseList
        courses={courses}
        rhCardDiscountEligible={Boolean(discountCard)}
      />
    </div>
  );
};

export default page;

function HeroSection() {
  return (
    <div className="min-h-72 w-full bg-gray-50 py-10 md:py-10">
      <div className="container flex h-full min-h-40 flex-col justify-center gap-6">
        <h2 className="text-2xl font-semibold md:text-4xl">
          Explore Healthcare Courses
        </h2>
        <p className="max-w-xl leading-6 text-gray-700">
          Advance your medical career with industry-leading clinical training
          and certifications, designed by top healthcare professionals.
        </p>
        <Link
          href="/#membership-benefits"
          className="text-primary w-fit text-sm font-medium underline underline-offset-4"
        >
          Explore RH Membership Card benefits
        </Link>
      </div>
    </div>
  );
}
