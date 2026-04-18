import { getWorkshops } from "@/actions/workshopActions";
import { WorkshopClient } from "@/components/admin/WorkshopClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin - Workshop Management",
};

export default async function AdminWorkshopPage() {
  const workshops = await getWorkshops();

  return (
    <div className="">
      <WorkshopClient workshops={workshops} />
    </div>
  );
}
