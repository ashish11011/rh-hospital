import { getWorkshops } from "@/app/actions/workshopActions";
import { WorkshopClient } from "./components/WorkshopClient";

export const metadata = {
  title: "Admin - Workshop Management",
};

export default async function AdminWorkshopPage() {
  const workshops = await getWorkshops();

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">Manage all your workshop listings here.</p>
      </div>
      
      <WorkshopClient workshops={workshops} />
    </div>
  );
}
