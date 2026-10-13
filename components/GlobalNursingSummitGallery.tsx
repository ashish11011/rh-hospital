import Image from "next/image";
import { publicAssetUrl } from "@/lib/publicAsset";
import { GLOBAL_CONFRENCE_IMAGES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function GlobalNursingSummitGallery() {
  return (
    <section
      aria-labelledby="global-nursing-summit-title"
      className="container py-12 md:py-16"
    >
      <div className="mb-8 max-w-2xl space-y-3">
        <Badge
          variant="outline"
          className="border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold tracking-wider text-green-700"
        >
          SUMMIT HIGHLIGHTS
        </Badge>
        <h2
          id="global-nursing-summit-title"
          className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl"
        >
          GLOBAL NURSING SUMMIT 2026
        </h2>
        <p className="text-sm text-slate-500 md:text-base">
          Explore moments from the Global Nursing Summit 2026.
        </p>
      </div>
      <figure className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
        <video
          controls
          playsInline
          preload="none"
          poster={publicAssetUrl(GLOBAL_CONFRENCE_IMAGES[0]) || undefined}
          aria-label="Global Nursing Summit 2026 highlights video"
          className="aspect-video w-full object-contain"
        >
          <source
            src={publicAssetUrl("website-image/globalsubmit.mp4")}
            type="video/mp4"
          />
          Your browser does not support video playback. You can{" "}
          <a href={publicAssetUrl("website-image/globalsubmit.mp4")}>
            watch the Global Nursing Summit video here
          </a>
          .
        </video>
      </figure>
      {GLOBAL_CONFRENCE_IMAGES.length > 0 && (
        <Carousel
          opts={{ align: "start", loop: true }}
          aria-label="Global Nursing Summit 2026 photos"
          className="w-full"
        >
          <CarouselContent>
            {GLOBAL_CONFRENCE_IMAGES.map((src, index) => (
              <CarouselItem
                key={src}
                aria-label={`Photo ${index + 1} of ${GLOBAL_CONFRENCE_IMAGES.length}`}
                className="md:basis-1/2 lg:basis-1/3"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={src}
                    alt={`Global Nursing Summit 2026 event photo ${index + 1}`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-contain"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500"></p>
            <div className="flex items-center gap-2">
              <CarouselPrevious className="static size-10 translate-y-0" />
              <CarouselNext className="static size-10 translate-y-0" />
            </div>
          </div>
        </Carousel>
      )}
    </section>
  );
}
