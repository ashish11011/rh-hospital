import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const page = () => {
    const workshopData = [{ "idx": 5, "id": "b4f95ab7-9ae7-46f8-8dac-bb6d299b3ec0", "name": "SIMTECH", "bannerImage": "https://rh-healthcare.s3.ap-south-1.amazonaws.com/1779450554173-WhatsApp_Image_2026-05-22_at_10.25.55_AM__1_.jpeg", "start_time": "2026-06-06 04:00:00", "end_time": "2026-06-06 10:30:00", "online_price": 300, "offline_price": 500, "is_completed": true }]
    return (
        <div className=' py-20  max-w-7xl px-4 mx-auto'>
            <div className='  grid grid-cols-1 md:grid-cols-3 gap-4'>
                {workshopData.map((ws) => {
                    return (
                        <Link key={ws.id} href={`/course-certificate/${ws.id}`} className="group">
                            <Card className=" p-0 overflow-hidden  flex flex-col h-full cursor-pointer">
                                {/* Image */}
                                <div className="relative overflow-hidden bg-gray-200">
                                    <Image
                                        src={ws.bannerImage}
                                        alt={ws.name}
                                        width={400}
                                        height={400}
                                        className=' object-contain'
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col grow">
                                    <h2 className="text-xl capitalize font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                        {ws.name}
                                    </h2>

                                    {/* Price and Action */}
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">

                                        <span className="text-primary font-medium text-sm flex gap-2 items-center group-hover:underline">
                                            View Details <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default page