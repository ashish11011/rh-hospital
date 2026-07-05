import { checkAuthGetUser } from "./action";

export default async function DashboardPage() {
  const userProfile = await checkAuthGetUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Welcome back, {userProfile?.name} !
        </h1>
        <p className="mt-1 text-slate-500">
          Here is an overview of your learning progress.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-6">
          <h3 className="font-semibold text-slate-700">Active Courses</h3>
          <p className="text-primary mt-2 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-6">
          <h3 className="font-semibold text-slate-700">Workshops</h3>
          <p className="text-primary mt-2 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-6">
          <h3 className="font-semibold text-slate-700">Certificates</h3>
          <p className="text-primary mt-2 text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}
