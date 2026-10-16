import { formatWorkshopDate } from "@/helper/workshopDateTime";
import React from "react";
import { getWorkshopById } from "@/actions/workshopActions";
import { notFound } from "next/navigation";
import { CourseCertificateForm } from "./CourseCertificateForm";
import Image from "next/image";
import { getS3AssetUrl } from "@/lib/s3Asset";

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const resolvedParams = await params;
  const workshop = await getWorkshopById(resolvedParams.slug);
  if (!workshop) {
    notFound();
  }

  return (
    <div className="container mx-auto min-h-screen space-y-8 px-4 py-12 md:px-6">
      <div className="space-y-3 text-center">
        <h1 className="text-primary text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Download Your Certificate
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl md:text-lg">
          Enter your registration details below to download your certificate for
          the workshop.
        </p>
      </div>

      <div className="bg-card mx-auto flex w-full max-w-lg flex-col gap-8 p-6 md:p-8">
        {workshop.bannerImage ? (
          <Image
            width={400}
            height={300}
            src={getS3AssetUrl(workshop.bannerImage)}
            alt={workshop.name}
            className="h-auto w-full object-contain"
          />
        ) : (
          <div className="bg-muted text-muted-foreground flex aspect-video w-full items-center justify-center rounded-lg md:w-2/5">
            No Image
          </div>
        )}
        <div className="flex-1 space-y-3 text-center md:text-left">
          <h2 className="text-2xl font-bold">{workshop.name}</h2>
          <p className="text-muted-foreground font-medium">
            {formatWorkshopDate(workshop.startTime)} to{" "}
            {formatWorkshopDate(workshop.endTime)}
          </p>
        </div>
      </div>

      <CourseCertificateForm workshopId={workshop.id} />
    </div>
  );
};

export default page;
