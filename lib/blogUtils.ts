export function normalizeBlogSlug(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/^\/?blog\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function blogPath(slug: string) {
  return `/blog/${normalizeBlogSlug(slug)}`;
}

export function splitBlogTags(value: string | string[] | null | undefined) {
  if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
