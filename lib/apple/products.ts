export const appleCourseProducts = {
  nrpfornurses: ["nrpfornurses", "nrp-for-nurses"],
  palsfornurses: ["palsfornurses", "pals-for-nurses"],
  triageemergenciesfornurses: [
    "triageemergenciesfornurses",
    "triage-emergencies-for-nurses",
  ],
} as const;

export function appleProductForSlug(slug: string): string | undefined {
  const normalized = slug
    .trim()
    .replace(/^\/?courses\//, "")
    .replace(/\/$/, "");
  return Object.entries(appleCourseProducts).find(([, slugs]) =>
    (slugs as readonly string[]).includes(normalized),
  )?.[0];
}

export function courseSlugsForAppleProduct(productId: string): string[] {
  const slugs =
    appleCourseProducts[productId as keyof typeof appleCourseProducts];
  return slugs ? slugs.flatMap((slug) => [slug, `/courses/${slug}`]) : [];
}
