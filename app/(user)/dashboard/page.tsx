import { checkAuthGetUser, getUserRegisteredWorkshops } from "./action";

import { getUserEnrolledCoursesByEmail } from "@/lib/userDashboardData";
import Link from "next/link";
import { RhIdCardPanel } from "@/components/id-card/RhIdCardPanel";

export default async function DashboardPage() {
  const userProfile = await checkAuthGetUser();
  const courses = userProfile
    ? await getUserEnrolledCoursesByEmail(userProfile.email)
    : [];
  const workshops = await getUserRegisteredWorkshops();

  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
      <div className="min-w-0 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Welcome back, {userProfile?.name} !
          </h1>
          <p className="mt-1 text-slate-500">
            Here is an overview of your learning progress.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-xl bg-slate-50 p-5">
            <h3 className="font-semibold text-slate-700">
              <Link href="/dashboard/courses">My Courses →</Link>
            </h3>
            <p className="text-primary mt-2 text-3xl font-bold">
              {courses.length}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-5">
            <h3 className="font-semibold text-slate-700">Workshops</h3>
            <p className="text-primary mt-2 text-3xl font-bold">
              {workshops.length}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-5">
            <h3 className="font-semibold text-slate-700">Certificates</h3>
            <p className="text-primary mt-2 text-3xl font-bold">0</p>
          </div>
        </div>
      </div>

      <RhIdCardPanel />
    </div>
  );
}
