import { ProfileForm } from "@/components/dashboard/profile-form";
import { checkAuthGetUser } from "../action";

export default async function ProfilePage() {
  const userProfile = await checkAuthGetUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My Profile
        </h1>
        <p className="mt-1 text-slate-500">
          Manage your personal information and contact details.
        </p>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <ProfileForm
          initialData={userProfile}
          email={userProfile?.email as string}
        />
      </div>
    </div>
  );
}
