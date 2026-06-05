import { formatDate, formatTime } from "@/helper/formatDate"
import { ArrowRight, Calendar, Clock, IndianRupee } from "lucide-react"
import Link from "next/link"
import { Card } from "../ui/card"

export const WorkshowListCard = ({ ws, isCompleted }: any) => {
    return (
        <Link key={ws.id} href={`/workshops/${ws.id}`} className="group">
            <Card className=" p-0 overflow-hidden  flex flex-col h-full cursor-pointer">
                {/* Image */}
                <div className="relative h-56 w-full overflow-hidden bg-gray-200">
                    {ws.bannerImage ? (
                        <img
                            src={ws.bannerImage}
                            alt={ws.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image Available
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col grow">
                    <h2 className="text-xl capitalize font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {ws.name}
                    </h2>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 grow">
                        {ws.description}
                    </p>

                    {
                        !isCompleted && (
                            <div className="space-y-3 mb-6 pt-4 border-t border-gray-100">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 mr-3 text-primary" />
                                    <span>{formatDate(ws.startTime)}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="w-4 h-4 mr-3 text-primary" />
                                    <span>
                                        {formatTime(ws.startTime)} - {formatTime(ws.endTime)}
                                    </span>
                                </div>
                            </div>
                        )
                    }



                    {/* Price and Action */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                        {
                            !isCompleted && (
                                <div className="flex items-center font-semibold text-lg text-gray-900">
                                    <IndianRupee className="w-4 h-4 mr-1 text-gray-600" />
                                    {ws.onlinePrice}
                                </div>
                            )
                        }
                        <span className="text-primary font-medium text-sm flex gap-2 items-center group-hover:underline">
                            View Details <ArrowRight className="w-4 h-4" />
                        </span>
                    </div>
                </div>
            </Card>
        </Link>
    )
}

