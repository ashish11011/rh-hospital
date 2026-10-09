export function CourseItemBanner({ title }: { title: string }) {
  return (
    <span
      className="relative block aspect-video w-full overflow-hidden rounded-md bg-slate-100 bg-cover bg-center"
      style={{ backgroundImage: 'url("https://d2c3lsl35lix55.cloudfront.net/website-image/content-banner.png")' }}
    >
      <span className="absolute inset-0 flex items-center justify-center overflow-y-auto p-4 text-center">
        <span className="max-w-full whitespace-normal break-words rounded bg-white/85 px-3 py-2 text-sm font-semibold text-slate-900">
          {title.trim() || "Untitled"}
        </span>
      </span>
    </span>
  );
}

