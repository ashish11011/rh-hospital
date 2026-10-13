import { publicAssetUrl } from "@/lib/publicAsset";
import { getUserCertificate } from "../action";
import { Button } from "@/components/ui/button";
import { Download, FileBadge } from "lucide-react";
import Image from "next/image";
import { getS3AssetUrl } from "@/lib/s3Asset";
import { formatWorkshopDate } from "@/helper/workshopDateTime";

export default async function CertificatesPage() {
  const { workshopCertificates, seminarCertificates } =
    await getUserCertificate();

  const allCertificates = [...workshopCertificates, ...seminarCertificates];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My Certificates
        </h1>
        <p className="mt-1 text-slate-500">
          View and download certificates from completed courses and workshops.
        </p>
      </div>

      {allCertificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-20 text-center">
          <FileBadge className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-slate-500">
            You haven't earned any certificates yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allCertificates.map((cert, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {getS3AssetUrl(cert.workshopImage) ? (
                <div className="relative h-auto w-full bg-slate-100">
                  <Image
                    src={getS3AssetUrl(cert.workshopImage)}
                    alt={cert.workshopName}
                    height={400}
                    width={500}
                    className="h-auto w-full object-contain"
                  />
                </div>
              ) : (
                <div className="from-primary/10 to-primary/5 flex h-40 w-full items-center justify-center border-b border-slate-100 bg-gradient-to-br">
                  <FileBadge className="text-primary/40 h-16 w-16" />
                </div>
              )}

              <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-2 line-clamp-2 font-semibold text-slate-900">
                  {cert.workshopName}
                </h3>
                {cert.workshopTime && (
                  <p className="mt-auto mb-4 text-sm text-slate-500">
                    {formatWorkshopDate(cert.workshopTime)}
                  </p>
                )}

                <Button className="mt-auto w-full gap-2" asChild>
                  <a
                    href={
                      publicAssetUrl(cert.certificate)!
                    }
                    target="_blank"
                    rel="noreferrer download"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
