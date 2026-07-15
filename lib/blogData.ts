import { blog } from "@/db";
import { normalizeBlogSlug } from "@/lib/blogUtils";
import { db } from "@/lib/dbConfig";
import { and, desc, eq, isNull, lte, or } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const BLOG_CACHE_SECONDS = 7200;
export const BLOG_LIST_CACHE_TAG = "blogs:published";
export const FEATURED_BLOGS_CACHE_TAG = "blogs:featured";

export function blogDetailCacheTag(slug: string) {
  return `blog:slug:${normalizeBlogSlug(slug)}`;
}

const publishedBlogSelect = {
  id: blog.id,
  title: blog.title,
  slug: blog.slug,
  shortDescription: blog.shortDescription,
  authorName: blog.authorName,
  featuredImage: blog.featuredImage,
  bannerImage: blog.bannerImage,
  category: blog.category,
  tags: blog.tags,
  isFeatured: blog.isFeatured,
  publishedAt: blog.publishedAt,
  createdAt: blog.createdAt,
};

async function fetchPublishedBlogs() {
  const now = new Date();

  return db
    .select(publishedBlogSelect)
    .from(blog)
    .where(
      and(
        eq(blog.status, "published"),
        or(lte(blog.publishedAt, now), isNull(blog.publishedAt)),
      ),
    )
    .orderBy(desc(blog.isFeatured), desc(blog.publishedAt), desc(blog.createdAt));
}

export const getPublishedBlogs = unstable_cache(
  fetchPublishedBlogs,
  ["published-blogs"],
  {
    revalidate: BLOG_CACHE_SECONDS,
    tags: [BLOG_LIST_CACHE_TAG],
  },
);

async function fetchFeaturedPublishedBlogs(limit = 3) {
  const now = new Date();

  return db
    .select(publishedBlogSelect)
    .from(blog)
    .where(
      and(
        eq(blog.status, "published"),
        eq(blog.isFeatured, true),
        or(lte(blog.publishedAt, now), isNull(blog.publishedAt)),
      ),
    )
    .orderBy(desc(blog.publishedAt), desc(blog.createdAt))
    .limit(limit);
}

export const getFeaturedPublishedBlogs = unstable_cache(
  fetchFeaturedPublishedBlogs,
  ["featured-published-blogs"],
  {
    revalidate: BLOG_CACHE_SECONDS,
    tags: [FEATURED_BLOGS_CACHE_TAG],
  },
);

async function fetchPublishedBlogBySlug(slug: string) {
  const cleanSlug = normalizeBlogSlug(slug);
  const now = new Date();

  const [record] = await db
    .select()
    .from(blog)
    .where(
      and(
        eq(blog.slug, cleanSlug),
        eq(blog.status, "published"),
        or(lte(blog.publishedAt, now), isNull(blog.publishedAt)),
      ),
    )
    .limit(1);

  return record ?? null;
}

export async function getPublishedBlogBySlug(slug: string) {
  const cleanSlug = normalizeBlogSlug(slug);

  return unstable_cache(
    () => fetchPublishedBlogBySlug(cleanSlug),
    ["published-blog-by-slug", cleanSlug],
    {
      revalidate: BLOG_CACHE_SECONDS,
      tags: [blogDetailCacheTag(cleanSlug)],
    },
  )();
}
