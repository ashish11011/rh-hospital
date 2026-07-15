export function publicCoursePath(slug: string) {
  const cleanSlug = slug.replace(/^\/?courses\//, "").replace(/^\/+/, "");
  return `/courses/${cleanSlug}`;
}
