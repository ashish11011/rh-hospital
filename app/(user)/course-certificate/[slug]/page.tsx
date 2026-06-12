import React from 'react'
import { getWorkshopById } from '@/actions/workshopActions'
import { notFound } from 'next/navigation'
import { CourseCertificateForm } from './CourseCertificateForm'
import Image from 'next/image'

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const resolvedParams = await params
    const workshop = await getWorkshopById(resolvedParams.slug)
    if (!workshop) {
        notFound()
    }

    return (
        <div className="container mx-auto py-12 px-4 md:px-6 space-y-8 min-h-screen">
            <div className="text-center space-y-3">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">Download Your Certificate</h1>
                <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
                    Enter your registration details below to download your certificate for the workshop.
                </p>
            </div>

            <div className="max-w-lg w-full mx-auto flex flex-col gap-8  bg-card p-6 md:p-8">
                {workshop.bannerImage ? (
                    <Image
                        width={400}
                        height={300}
                        src={workshop.bannerImage}
                        alt={workshop.name}
                        className="w-full object-contain h-auto"
                    />
                ) : (
                    <div className="w-full md:w-2/5 aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                        No Image
                    </div>
                )}
                <div className="flex-1 space-y-3 text-center md:text-left">
                    <h2 className="text-2xl font-bold">{workshop.name}</h2>
                    <p className="text-muted-foreground font-medium">
                        {new Date(workshop.startTime).toLocaleDateString()} to {new Date(workshop.endTime).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <CourseCertificateForm workshopId={workshop.id} />
        </div>
    )
}

export default page