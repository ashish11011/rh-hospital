import Link from "next/link";

export default function Header() {
  return (
    <div className="bg-primary hidden w-full md:block">
      <div className="container mx-auto">
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center gap-2">
            <Link
              href={"/rh-healthcare-ntai-conference-ric-jaipur-2026"}
              className="cursor-pointer text-sm font-semibold text-white"
            >
              🌍 <span className="underline">GLOBAL NURSING SUMMIT 2026</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
