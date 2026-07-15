"use server";

import { blog } from "@/db";
import { requireAdmin } from "@/lib/adminAuth";
import {
  BLOG_LIST_CACHE_TAG,
  FEATURED_BLOGS_CACHE_TAG,
  blogDetailCacheTag,
} from "@/lib/blogData";
import { blogPath, normalizeBlogSlug, splitBlogTags } from "@/lib/blogUtils";
import { db } from "@/lib/dbConfig";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

export type BlogStatus = "draft" | "published" | "archived";

export type BlogInput = {
  title: string;
  slug: string;
  shortDescription?: string | null;
  content: string;
  authorName: string;
  featuredImage?: string | null;
  bannerImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  category?: string | null;
  tags?: string | string[] | null;
  status: BlogStatus;
  isFeatured: boolean;
  publishedAt?: Date | string | null;
};

type PublicBlogCacheState = {
  slug: string;
  status: BlogStatus;
  isFeatured: boolean;
  publishedAt: Date | string | null;
};

function cleanBlogInput(data: BlogInput) {
  const status = data.status || "draft";
  const publishedAt = data.publishedAt
    ? new Date(data.publishedAt)
    : status === "published"
      ? new Date()
      : null;

  return {
    title: data.title.trim(),
    slug: normalizeBlogSlug(data.slug || data.title),
    shortDescription: data.shortDescription?.trim() || null,
    content: data.content.trim(),
    authorName: data.authorName.trim(),
    featuredImage: data.featuredImage?.trim() || null,
    bannerImage: data.bannerImage?.trim() || null,
    metaTitle: data.metaTitle?.trim() || null,
    metaDescription: data.metaDescription?.trim() || null,
    metaKeywords: data.metaKeywords?.trim() || null,
    category: data.category?.trim() || null,
    tags: splitBlogTags(data.tags),
    status,
    isFeatured: data.isFeatured === true,
    publishedAt,
    updatedAt: new Date(),
  };
}

function validateBlog(data: BlogInput) {
  if (!data.title.trim()) throw new Error("Title is required");
  if (!data.content.trim()) throw new Error("Content is required");
  if (!data.authorName.trim()) throw new Error("Author name is required");
  if (!normalizeBlogSlug(data.slug || data.title)) throw new Error("Slug is required");
}

function isPublishedForPublicCache(record?: PublicBlogCacheState | null) {
  if (!record || record.status !== "published") return false;
  if (!record.publishedAt) return true;
  return new Date(record.publishedAt) <= new Date();
}

function invalidatePublicBlogCache({
  before,
  after,
}: {
  before?: PublicBlogCacheState | null;
  after?: PublicBlogCacheState | null;
}) {
  const beforeIsPublic = isPublishedForPublicCache(before);
  const afterIsPublic = isPublishedForPublicCache(after);

  if (beforeIsPublic || afterIsPublic) {
    updateTag(BLOG_LIST_CACHE_TAG);
  }

  if ((beforeIsPublic && before?.isFeatured) || (afterIsPublic && after?.isFeatured)) {
    updateTag(FEATURED_BLOGS_CACHE_TAG);
    revalidatePath("/");
  }

  for (const record of [before, after]) {
    if (record && isPublishedForPublicCache(record)) updateTag(blogDetailCacheTag(record.slug));
  }
}

export async function getAdminBlogs({
  search = "",
  status = "",
}: {
  search?: string;
  status?: string;
} = {}) {
  await requireAdmin("blog");

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(blog.title, `%${search}%`),
        ilike(blog.slug, `%${search}%`),
        ilike(blog.authorName, `%${search}%`),
        ilike(blog.category, `%${search}%`),
      ),
    );
  }
  if (status && ["draft", "published", "archived"].includes(status)) {
    conditions.push(eq(blog.status, status as BlogStatus));
  }

  const query = db.select().from(blog);
  const filteredQuery = conditions.length > 0 ? query.where(and(...conditions)) : query;

  return filteredQuery.orderBy(desc(blog.updatedAt), desc(blog.createdAt));
}

export async function getAdminBlog(id: string) {
  await requireAdmin("blog");

  const [record] = await db.select().from(blog).where(eq(blog.id, id)).limit(1);
  return record ?? null;
}

export async function createBlog(data: BlogInput) {
  await requireAdmin("blog");
  validateBlog(data);
  const cleanData = cleanBlogInput(data);

  const [created] = await db
    .insert(blog)
    .values(cleanData)
    .returning({ id: blog.id, slug: blog.slug });

  revalidatePath("/admin/blog");
  const createdState = {
    slug: created.slug,
    status: cleanData.status,
    isFeatured: cleanData.isFeatured,
    publishedAt: cleanData.publishedAt,
  };

  if (isPublishedForPublicCache(createdState)) {
    revalidatePath("/blog");
    revalidatePath(blogPath(created.slug));
  }
  invalidatePublicBlogCache({ after: createdState });

  return created;
}

export async function updateBlog(id: string, data: BlogInput) {
  await requireAdmin("blog");
  validateBlog(data);

  const cleanData = cleanBlogInput(data);
  const [existing] = await db
    .select({
      slug: blog.slug,
      status: blog.status,
      isFeatured: blog.isFeatured,
      publishedAt: blog.publishedAt,
    })
    .from(blog)
    .where(eq(blog.id, id))
    .limit(1);

  await db.update(blog).set(cleanData).where(eq(blog.id, id));

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  const nextState = {
    slug: cleanData.slug,
    status: cleanData.status,
    isFeatured: cleanData.isFeatured,
    publishedAt: cleanData.publishedAt,
  };

  if (isPublishedForPublicCache(existing) || isPublishedForPublicCache(nextState)) {
    revalidatePath("/blog");
  }
  if (isPublishedForPublicCache(nextState)) {
    revalidatePath(blogPath(cleanData.slug));
  }
  if (
    existing?.slug &&
    existing.slug !== cleanData.slug &&
    isPublishedForPublicCache(existing)
  ) {
    revalidatePath(blogPath(existing.slug));
  }
  invalidatePublicBlogCache({ before: existing, after: nextState });
}

export async function updateBlogStatus(id: string, status: BlogStatus) {
  await requireAdmin("blog");
  if (!["draft", "published", "archived"].includes(status)) throw new Error("Invalid blog status");

  const publishedAt = status === "published" ? new Date() : undefined;

  const [existing] = await db
    .select({
      slug: blog.slug,
      status: blog.status,
      isFeatured: blog.isFeatured,
      publishedAt: blog.publishedAt,
    })
    .from(blog)
    .where(eq(blog.id, id))
    .limit(1);

  await db
    .update(blog)
    .set({
      status,
      ...(publishedAt ? { publishedAt } : {}),
      updatedAt: new Date(),
    })
    .where(eq(blog.id, id));

  revalidatePath("/admin/blog");
  const nextState = existing
    ? {
        ...existing,
        status,
        publishedAt: publishedAt || existing.publishedAt,
      }
    : null;

  if (isPublishedForPublicCache(existing) || isPublishedForPublicCache(nextState)) {
    revalidatePath("/blog");
  }
  if (
    existing?.slug &&
    (isPublishedForPublicCache(existing) || isPublishedForPublicCache(nextState))
  ) {
    revalidatePath(blogPath(existing.slug));
  }
  invalidatePublicBlogCache({ before: existing, after: nextState });
}

export async function deleteBlog(id: string) {
  await requireAdmin("blog");

  const [existing] = await db
    .select({
      slug: blog.slug,
      status: blog.status,
      isFeatured: blog.isFeatured,
      publishedAt: blog.publishedAt,
    })
    .from(blog)
    .where(eq(blog.id, id))
    .limit(1);

  await db.delete(blog).where(eq(blog.id, id));
  revalidatePath("/admin/blog");
  if (isPublishedForPublicCache(existing)) {
    revalidatePath("/blog");
    revalidatePath(blogPath(existing.slug));
  }
  invalidatePublicBlogCache({ before: existing });
  redirect("/admin/blog");
}
