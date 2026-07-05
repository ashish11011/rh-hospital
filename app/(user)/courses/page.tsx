import CommingSoon from "@/components/CommingSoon";
import CourseList from "@/components/course/CourceList";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";
import React from "react";

const page = () => {
  return (
    <div>
      <HeroSection />
      <CourseList />
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
      </div>
    </div>
  );
}
