import { getWorkshopById } from "@/app/actions/workshopActions";
import { notFound } from "next/navigation";
import { Calendar, Clock, IndianRupee, MapPin, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/dbConfig";
import { workshop } from "@/db";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkshopRegistrationDialog } from "@/components/workshop/takeRegistratoinDialog";

export const revalidate = 600;


export default async function WorkshopDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const [ws]: any = await db.select().from(workshop).where(eq(workshop.id, id));

  if (!ws) {
    notFound();
  }

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (dateValue: any) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Banner Section */}
      <div className="w-full h-[40vh] md:h-[50vh] bg-gray-900 relative">
        {ws.bannerImage ? (
          <img
            src={ws.bannerImage}
            alt={ws.name}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-800">
            No Image
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent flex items-end">
          <div className="container mx-auto px-4 max-w-5xl pb-12">
            <h1 className="text-4xl md:text-5xl capitalize font-black text-white mb-4 ">
              {ws.name}
            </h1>
            <p className="text-lg text-gray-200 max-w-3xl line-clamp-2">
              {ws.description}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About the Workshop</h2>
              {/* Rich text Content */}
              <div
                className="prose prose-lg space-y-4 max-w-none prose-blue break-normal [&>p]:whitespace-pre-wrap [&>p]:wrap-break-word "
                dangerouslySetInnerHTML={{ __html: ws.content || "" }}
              />
            </section>
          </div>

          {/* Sidebar / Registration Details */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 bg-gray-50 ">
              <CardHeader>
                <CardTitle className="">Workshop Details</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex items-start">
                  <Calendar className="w-6 h-6 text-blue-600 mr-4 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Date</p>
                    <p className="text-gray-900 font-semibold">{formatDate(ws.startTime)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-6 h-6 text-blue-600 mr-4 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Time</p>
                    <p className="text-gray-900 font-semibold">
                      {formatTime(ws.startTime)} - {formatTime(ws.endTime)}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 font-medium mb-3">Investment</p>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-gray-600">
                      <Video className="w-4 h-4 mr-2" /> Online
                    </div>
                    <div className="font-bold text-xl text-gray-900 flex items-center">
                      <IndianRupee className="w-5 h-5" /> {ws.onlinePrice}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" /> Offline
                    </div>
                    <div className="font-bold text-xl text-gray-900 flex items-center">
                      <IndianRupee className="w-5 h-5" /> {ws.offlinePrice}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <WorkshopRegistrationDialog />
                  <p className="text-xs text-center text-gray-500">
                    Secure your spot before seats run out!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
