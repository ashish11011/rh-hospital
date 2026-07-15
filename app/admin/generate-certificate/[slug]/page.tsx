import React from 'react'
import { getWorkshopById } from '@/actions/workshopActions'
import { notFound } from 'next/navigation'
import { ClientForm } from './ClientForm'
import Image from 'next/image'
import { requireAdmin } from '@/lib/adminAuth'
import { getS3AssetUrl } from '@/lib/s3Asset'

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    await requireAdmin("full");

    const resolvedParams = await params
    const workshop = await getWorkshopById(resolvedParams.slug)

    if (!workshop) {
        notFound()
    }
    const bannerImageUrl = getS3AssetUrl(workshop.bannerImage)

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-12">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Generate Certificate</h1>
                <p className="text-muted-foreground">Send a certificate for this workshop.</p>
            </div>

            <div className="border rounded-md p-6 space-y-10 bg-card">
                <div className="flex flex-col justify-start items-start gap-8 w-full space-x-6">
                    {bannerImageUrl ? (
                        <Image
                            width={300}
                            height={300}
                            src={bannerImageUrl}
                            alt={workshop.name}
                            className="w-auto h-28 object-contain"
                        />
                    ) : (
                        <div className="w-32 h-32 bg-muted rounded-md flex items-center justify-center text-muted-foreground border">
                            No Image
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl font-semibold">{workshop.name}</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {new Date(workshop.startTime).toLocaleDateString()} - {new Date(workshop.endTime).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="border-t pt-6">
                    <ClientForm workshopId={workshop.id} />
                </div>
            </div>
        </div>
    )
}

export default page
