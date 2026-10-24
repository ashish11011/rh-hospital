import { publicMediaHtml } from "@/lib/publicAsset";
import { notFound } from "next/navigation";
import { Calendar, Clock, IndianRupee, MapPin, Video } from "lucide-react";
import { db } from "@/lib/dbConfig";
import { workshop, workshopImage } from "@/db";
import { asc, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkshopRegistration } from "@/components/workshop/takeRegistratoinDialog";
import { Suspense } from "react";
import Image from "next/image";
import { getS3AssetUrl } from "@/lib/s3Asset";
import {
  formatWorkshopDate as formatDate,
  formatWorkshopTime as formatTime,
} from "@/helper/workshopDateTime";
import {
  getWorkshopAttendanceModes,
  getWorkshopModePrice,
} from "@/lib/workshopAttendance";
import { MobileAppCTA } from "@/components/MobileAppCTA";

export const revalidate = 600;
export const dynamic = "force-static";

export default async function WorkshopDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const [ws]: any = await db.select().from(workshop).where(eq(workshop.id, id));

  if (!ws) {
    notFound();
  }

  const cleanContent = ws.content?.replace(/&nbsp;/g, " ");
  const bannerImageUrl = getS3AssetUrl(ws.bannerImage);

  return (
    <div className="min-h-screen bg-white">
      {/* Banner Section */}
      <div className="relative h-[40vh] w-full bg-gray-900 md:h-[50vh]">
        {bannerImageUrl ? (
          <Image
            height={700}
            width={1280}
            src={bannerImageUrl}
            alt={ws.name}
            className="h-full w-full object-cover opacity-60"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-800 text-gray-500">
            No Image
          </div>
        )}
        <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/80 to-transparent">
          <div className="container mx-auto max-w-4xl! px-4 pb-12">
            <h1 className="mb-4 text-4xl font-black text-white capitalize md:text-5xl">
              {ws.name}
            </h1>
            <p className="max-w-3xl text-lg text-gray-200">{ws.description}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl! px-4 py-12">
        <div className="grid grid-cols-1 gap-12">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            <section>
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                About the Workshop
              </h2>
              {/* Rich text Content */}
              <div
                className="prose prose-lg prose-blue max-w-none space-y-4 break-normal [&>p]:wrap-break-word [&>p]:whitespace-pre-wrap [&>p>a]:text-blue-500 [&>p>span]:wrap-break-word"
                dangerouslySetInnerHTML={{
                  __html: publicMediaHtml(cleanContent || ""),
                }}
              />
            </section>
          </div>

          {/* Sidebar / Registration Details */}
          {!ws.isCompleted ? (
            <WsForm ws={ws} />
          ) : (
            <WsCompletionSection workshopId={ws.id} />
          )}
        </div>
      </div>
      <MobileAppCTA />
    </div>
  );
}

async function WsForm({ ws }: any) {
  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-24 bg-gray-50">
        <CardHeader>
          <CardTitle className="">Workshop Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-start">
            <Calendar className="mt-0.5 mr-4 h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="font-semibold text-gray-900">
                {formatDate(ws.startTime)}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <Clock className="mt-0.5 mr-4 h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Time</p>
              <p className="font-semibold text-gray-900">
                {formatTime(ws.startTime)} - {formatTime(ws.endTime)} IST
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="mb-3 text-sm font-medium text-gray-500">Investment</p>
            {getWorkshopAttendanceModes(ws.attendanceMode).map((mode) => (
              <div
                key={mode}
                className="mb-2 flex items-center justify-between"
              >
                <div className="flex items-center text-gray-600 capitalize">
                  {mode === "online" ? (
                    <Video className="mr-2 h-4 w-4" />
                  ) : (
                    <MapPin className="mr-2 h-4 w-4" />
                  )}
                  {mode}
                </div>
                <div className="flex items-center text-xl font-bold text-gray-900">
                  <IndianRupee className="h-5 w-5" />{" "}
                  {getWorkshopModePrice(ws, mode)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <WorkshopRegistration
              workshopId={ws.id}
              attendanceMode={ws.attendanceMode}
              priceOnline={ws.onlinePrice}
              priceOffline={ws.offlinePrice}
              whatsappLink={ws.whatsappLink}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function WsCompletionSection({ workshopId }: any) {
  return (
    <div>
      <p className="text-center text-gray-600">
        {" "}
        This workshop has been completed successfully. You can explore the event
        highlights and images below or contact us for more information.
      </p>
      {/* Gallery Section */}
      <Suspense
        fallback={
          <div>
            <p className="text-center text-gray-600"> Loading Images...</p>
          </div>
        }
      >
        <WorkshopImages workshopId={workshopId} />
      </Suspense>
    </div>
  );
}

async function WorkshopImages({ workshopId }: any) {
  const workshopImages = await db
    .select()
    .from(workshopImage)
    .where(eq(workshopImage.workshopId, workshopId))
    .orderBy(asc(workshopImage.displayOrder));
  return (
    <div className="mt-12">
      {workshopImages.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">Gallery</h2>
            <span className="text-gray-500">
              {workshopImages.length} Photos
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {workshopImages.map((img: any) => (
              <div key={img.id} className="h-auto w-full">
                <Image
                  src={getS3AssetUrl(img.image)}
                  alt={`Workshop ${img.displayOrder}`}
                  width={1920}
                  height={1080}
                  className="h-auto max-h-112 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
