import { publicAssetUrl } from "@/lib/publicAsset";
import Image from "next/image";

export default function LeftPanel() {
  return (
    <section className="relative hidden lg:block">
      <Image
        src="https://media.rhhealthcaresimulation.com/public/website-image/rh-building.webp"
        fill
        priority
        alt="Healthcare"
        className="object-cover"
      />

      <div className="absolute inset-0 bg-linear-to-b from-green-100/10 via-green-100/20 to-green-950/70" />

      <div className="absolute bottom-16 left-14 text-white">
        <h1 className="text-4xl leading-tight font-bold">
          Elevating Healthcare Standards.
        </h1>

        <p className="mt-6 text-lg leading-8 text-green-100">
          Join the world's trusted network for medical education and clinical
          certification powered by excellence.
        </p>

        {/* <div className="mt-12 flex items-center gap-4">
          <div className="flex -space-x-4">
            <Image
              src={publicAssetUrl("avatars/1.jpg")}
              width={50}
              height={50}
              alt=""
              className="rounded-full border-4 border-white"
            />

            <Image
              src={publicAssetUrl("avatars/2.jpg")}
              width={50}
              height={50}
              alt=""
              className="rounded-full border-4 border-white"
            />
          </div>

          <span className="font-semibold">Trusted by 10K+ Specialists</span>
        </div> */}
      </div>
    </section>
  );
}
