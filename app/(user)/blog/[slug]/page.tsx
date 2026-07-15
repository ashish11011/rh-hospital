import { Badge } from "@/components/ui/badge";
import { getPublishedBlogBySlug } from "@/lib/blogData";
import { blogPath } from "@/lib/blogUtils";
import { getS3AssetUrl } from "@/lib/s3Asset";
import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

export const revalidate = 7200;
export const dynamic = "force-static";

function hasHtmlContent(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getPublishedBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog not found | RH Healthcare",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = blog.metaTitle || `${blog.title} | RH Healthcare`;
  const description =
    blog.metaDescription ||
    blog.shortDescription ||
    "Read RH Healthcare Simulation Centre insights on healthcare simulation, nursing education, and clinical training.";
  const imageUrl = getS3AssetUrl(blog.bannerImage || blog.featuredImage);
  const canonicalPath = blogPath(blog.slug);
  const publishedTime = blog.publishedAt
    ? new Date(blog.publishedAt).toISOString()
    : undefined;
  const modifiedTime = blog.updatedAt
    ? new Date(blog.updatedAt).toISOString()
    : undefined;

  return {
    alternates: {
      canonical: canonicalPath,
    },
    authors: [{ name: blog.authorName }],
    description,
    keywords: blog.metaKeywords || undefined,
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: "RH Healthcare Simulation Centre",
      type: "article",
      publishedTime,
      modifiedTime,
      authors: [blog.authorName],
      tags: blog.tags || undefined,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: blog.title,
            },
          ]
        : undefined,
    },
    title,
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getPublishedBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const imageUrl = getS3AssetUrl(blog.bannerImage || blog.featuredImage);

  return (
    <article className="bg-white">
      <header className="border-b bg-gray-50 py-10 md:py-14">
        <div className="container max-w-4xl">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {blog.category && (
              <Badge variant="secondary">{blog.category}</Badge>
            )}
            {blog.isFeatured && <Badge>Featured</Badge>}
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            {blog.title}
          </h1>
          {blog.shortDescription && (
            <p className="text-muted-foreground mt-4 text-lg leading-8">
              {blog.shortDescription}
            </p>
          )}
          <div className="text-muted-foreground mt-5 flex flex-wrap items-center gap-3 text-sm">
            <span>By {blog.authorName}</span>
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {blog.publishedAt
                ? new Date(blog.publishedAt).toLocaleDateString()
                : new Date(blog.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl py-10">
        {imageUrl && (
          <Image
            width={1600}
            height={900}
            src={imageUrl}
            alt={blog.title}
            className="mb-8 aspect-[16/7] w-full rounded-xl object-cover"
          />
        )}
        {hasHtmlContent(blog.content) ? (
          <div
            className="blog-rich-content max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        ) : (
          <div className="text-base leading-8 whitespace-pre-wrap text-slate-700">
            {blog.content}
          </div>
        )}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t pt-6">
            {blog.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
