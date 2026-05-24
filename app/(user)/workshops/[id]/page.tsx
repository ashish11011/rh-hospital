import { notFound } from "next/navigation";
import { Calendar, Clock, IndianRupee, MapPin, Video } from "lucide-react";
import { db } from "@/lib/dbConfig";
import { workshop, workshopImage } from "@/db";
import { asc, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkshopRegistration } from "@/components/workshop/takeRegistratoinDialog";
import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";

export const revalidate = 600;

export default async function WorkshopDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const [ws]: any = await db.select().from(workshop).where(eq(workshop.id, id));

  if (!ws) {
    notFound();
  }

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      // timeStyle: "short",
    }).format(date);
  };

  const formatTime = (dateValue: any) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    return new Intl.DateTimeFormat("en-US", {
      // dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };


  const cleanContent = ws.content?.replace(/&nbsp;/g, " ");

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
          <div className="container mx-auto px-4 max-w-4xl! pb-12">
            <h1 className="text-4xl md:text-5xl capitalize font-black text-white mb-4 ">
              {ws.name}
            </h1>
            <p className="text-lg text-gray-200 max-w-3xl ">
              {ws.description}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl! py-12">
        <div className="grid grid-cols-1 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About the Workshop</h2>
              {/* Rich text Content */}
              <div
                className="prose prose-lg space-y-4 max-w-none prose-blue break-normal [&>p]:whitespace-pre-wrap [&>p]:wrap-break-word [&>p>span]:wrap-break-word [&>p>a]:text-blue-500 "
                dangerouslySetInnerHTML={{ __html: cleanContent || "" }}
              />
            </section>
          </div>

          {/* Sidebar / Registration Details */}
          {
            !ws.isCompleted ? (<WsForm ws={ws} formatDate={formatDate} formatTime={formatTime} />) : (<WsCompletionSection workshopId={ws.id} />)
          }



        </div>
      </div>
    </div>
  );
}

async function WsForm({ ws, formatDate, formatTime }: any) {
  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-24 bg-gray-50 ">
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
            <WorkshopRegistration workshopId={ws.id} priceOnline={ws.onlinePrice} priceOffline={ws.offlinePrice} />

          </div>
        </CardContent>
      </Card>
    </div>
  )
}


async function WsCompletionSection({ workshopId }: any) {

  return (
    <div>
      <p className="text-center text-gray-600">  This workshop has been completed successfully. You can explore the event highlights and images below or contact us for more information.
      </p>
      {/* Gallery Section */}
      <Suspense fallback={
        <div>
          <p className="text-center text-gray-600">  Loading Images...</p>
        </div>
      }>
        <WorkshopImages workshopId={workshopId} />
      </Suspense>
    </div>
  )
}

async function WorkshopImages({ workshopId }: any) {
  const workshopImages = await db.select().from(workshopImage).where(eq(workshopImage.workshopId, workshopId)).orderBy(asc(workshopImage.displayOrder));
  return (
    <div className=" mt-12">
      {workshopImages.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">Gallery</h2>
            <span className="text-gray-500">{workshopImages.length} Photos</span>
          </div>

          <div className=" flex flex-col gap-4">
            {workshopImages.map((img: any) => (
              <div
                key={img.id}
                className=" w-full h-auto"
              >
                <Image
                  src={img.image}
                  alt={`Workshop ${img.displayOrder}`}
                  width={1920}
                  height={1080}
                  className="w-full h-auto max-h-112 object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}