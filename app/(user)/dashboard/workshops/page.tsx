import { getUserRegisteredWorkshops } from "../action";
import { Button } from "@/components/ui/button";
import { CalendarDays, ExternalLink, MapPin, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getS3AssetUrl } from "@/lib/s3Asset";
import { formatWorkshopDateTime } from "@/helper/workshopDateTime";

export default async function WorkshopsPage() {
  const workshops = await getUserRegisteredWorkshops();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Workshops Registered
        </h1>
        <p className="mt-1 text-slate-500">
          View and manage the workshops you have registered for.
        </p>
      </div>

      {workshops.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-20 text-center">
          <CalendarDays className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-slate-500">
            You haven't registered for any workshops yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workshops.map((workshop, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {getS3AssetUrl(workshop.workshopImage) ? (
                <div className="relative h-40 w-full bg-slate-100">
                  <Image
                    src={getS3AssetUrl(workshop.workshopImage)}
                    alt={workshop.workshopName}
                    fill
                    className="object-cover"
                  />
                  {workshop.isCompleted && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-600 shadow-sm backdrop-blur-sm">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completed
                    </div>
                  )}
                </div>
              ) : (
                <div className="from-primary/10 to-primary/5 relative flex h-40 w-full items-center justify-center border-b border-slate-100 bg-gradient-to-br">
                  <CalendarDays className="text-primary/40 h-16 w-16" />
                  {workshop.isCompleted && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-600 shadow-sm backdrop-blur-sm">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completed
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {workshop.modeOfAttendance}
                  </Badge>
                  <Badge
                    variant={
                      workshop.paymentStatus === "pending"
                        ? "default"
                        : "outline"
                    }
                    className={
                      workshop.paymentStatus === "completed"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                        : "text-xs capitalize"
                    }
                  >
                    Payment: {workshop.paymentStatus}
                  </Badge>
                </div>

                <h3 className="mb-2 line-clamp-2 font-semibold text-slate-900">
                  {workshop.workshopName}
                </h3>

                {workshop.workshopTime && (
                  <p className="mt-auto mb-4 flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    {formatWorkshopDateTime(workshop.workshopTime)}
                  </p>
                )}

                <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 pt-4">
                  <Button className="w-full gap-2" variant="outline" asChild>
                    <Link href={`/workshops/${workshop.workshopId}`}>
                      View Details
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>

                  {workshop.whatsappLink && (
                    <Button
                      className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#20bd5a]"
                      asChild
                    >
                      <a
                        href={workshop.whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Join WhatsApp Group
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
