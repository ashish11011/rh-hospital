import Image from "next/image";
import { publicAssetUrl } from "@/lib/publicAsset";
import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Image
      src={publicAssetUrl("website-image/logo-rh-healthcare.png")}
      loading="eager"
      height={100}
      width={250}
      className={cn("h-12 w-auto object-contain", className)}
      alt="RH Healthcare"
    />
  );
}
