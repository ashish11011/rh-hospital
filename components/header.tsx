import Link from "next/link";

export default function Header() {
  return (
    <div className="bg-primary hidden w-full md:block">
      <div className="container mx-auto">
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center gap-2">
            <Link
              href={"/courses/"}
              className="cursor-pointer text-sm font-semibold text-white"
            >
              📚{" "}
              <span className="underline">STUDY THE BEST NURSING COURSE</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
