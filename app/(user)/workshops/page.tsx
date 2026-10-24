import { getWorkshops } from "@/actions/workshopActions";
import { MobileAppCTA } from "@/components/MobileAppCTA";
import WorkshopFAQ from "@/components/ui/AccordionStudio";
import { WorkshowListCard } from "@/components/workshop/WorkshowListCard";

export const metadata = {
  title: "Workshops",
  description:
    "Explore healthcare workshops by RH Healthcare Pvt. Ltd. and enhance your skills with professional training programs.",
  alternates: {
    canonical: "https://www.rhhealthcaresimulation.com/workshops",
  },
};

export const revalidate = 3600; // Revalidate every hour
export const dynamic = "force-static";

export default async function WorkshopsPage() {
  const workshops = await getWorkshops();

  const upcommingWorkshop = workshops.filter(
    (workshop) => !workshop.isCompleted,
  );
  const pastWorkshop = workshops.filter((workshop) => workshop.isCompleted);

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto max-w-6xl px-4">
        {upcommingWorkshop.length != 0 && (
          <div className="mb-16 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Upcoming Workshops
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600">
              Join our immersive learning experiences and take your skills to
              the next level.
            </p>
          </div>
        )}
        {upcommingWorkshop.length === 0 ? (
          <div className="py-20 text-center text-lg text-gray-500">
            No workshops available at the moment. Please check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {upcommingWorkshop.map((ws) => (
              <WorkshowListCard key={ws.id} ws={ws} />
            ))}
          </div>
        )}
      </div>
      <div className="container mx-auto max-w-6xl px-4 pt-16">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Past Workshops
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600">
            Explore the insightful sessions from our past workshops.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {pastWorkshop.map((ws) => (
            <WorkshowListCard isCompleted={true} key={ws.id} ws={ws} />
          ))}
        </div>
      </div>
      {/* FAQs */}
      <div className="container">
        <div className="mt-16 mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600">
            Here are some common questions about our workshops.
          </p>
        </div>
        <WorkshopFAQ />
      </div>
      <MobileAppCTA />
    </div>
  );
}
