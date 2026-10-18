import { formatDate, formatTime } from "@/helper/formatDate";
import { ArrowRight, Calendar, Clock, IndianRupee } from "lucide-react";
import Link from "next/link";
import { Card } from "../ui/card";
import { getS3AssetUrl } from "@/lib/s3Asset";
import Image from "next/image";
import {
  getWorkshopAttendanceModes,
  getWorkshopModePrice,
} from "@/lib/workshopAttendance";

export const WorkshowListCard = ({ ws, isCompleted }: any) => {
  const bannerImageUrl = getS3AssetUrl(ws.bannerImage);
  return (
    <Link key={ws.id} href={`/workshops/${ws.id}`} className="group">
      <Card className="flex h-full cursor-pointer flex-col overflow-hidden p-0">
        {/* Image */}
        <div className="relative h-52 w-full overflow-hidden bg-gray-200">
          {bannerImageUrl ? (
            <Image
              src={bannerImageUrl}
              alt={ws.name}
              width={500}
              height={500}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              No Image Available
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex grow flex-col p-6">
          <h2 className="group-hover:text-primary mb-2 line-clamp-2 text-xl font-bold text-gray-900 capitalize transition-colors">
            {ws.name}
          </h2>
          <p className="mb-6 line-clamp-3 grow text-sm text-gray-600">
            {ws.description}
          </p>

          {!isCompleted && (
            <div className="mb-6 space-y-3 border-t border-gray-100 pt-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="text-primary mr-3 h-4 w-4" />
                <span>{formatDate(ws.startTime)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="text-primary mr-3 h-4 w-4" />
                <span>
                  {formatTime(ws.startTime)} - {formatTime(ws.endTime)} IST
                </span>
              </div>
            </div>
          )}

          {/* Price and Action */}
          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
            {!isCompleted && (
              <div className="flex items-center text-lg font-semibold text-gray-900">
                <IndianRupee className="mr-1 h-4 w-4 text-gray-600" />
                {getWorkshopModePrice(
                  ws,
                  getWorkshopAttendanceModes(ws.attendanceMode)[0],
                )}
              </div>
            )}
            <span className="text-primary flex items-center gap-2 text-sm font-medium group-hover:underline">
              View Details <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
