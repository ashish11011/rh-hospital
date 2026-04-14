import { getWorkshops } from "@/app/actions/workshopActions";
import Link from "next/link";
import { Calendar, Clock, IndianRupee } from "lucide-react";
import { WorkshowListCard } from "@/components/workshop/WorkshowListCard";

export const metadata = {
  title: "Workshops - Learn & Grow",
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function WorkshopsPage() {
  const workshops = await getWorkshops();




  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Upcoming Workshops
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Join our immersive learning experiences and take your skills to the next level.
          </p>
        </div>

        {workshops.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-lg">
            No workshops available at the moment. Please check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workshops.map((ws) => (
              <WorkshowListCard key={ws.id} ws={ws} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
