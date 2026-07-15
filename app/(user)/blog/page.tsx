import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublishedBlogs } from "@/lib/blogData";
import { blogPath } from "@/lib/blogUtils";
import { getS3AssetUrl } from "@/lib/s3Asset";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 7200;
export const dynamic = "force-static";

const blogTitle =
  "Healthcare Simulation Blog | RH Healthcare Simulation Centre";
const blogDescription =
  "Read RH Healthcare Simulation Centre articles on nursing education, clinical simulation, healthcare training, workshops, and professional development.";

export const metadata: Metadata = {
  alternates: {
    canonical: "/blog",
  },
  description: blogDescription,
  keywords: [
    "RH Healthcare blog",
    "healthcare simulation",
    "nursing education",
    "clinical simulation training",
    "healthcare workshops",
    "Jaipur nursing training",
  ],
  openGraph: {
    title: blogTitle,
    description: blogDescription,
    url: "/blog",
    siteName: "RH Healthcare Simulation Centre",
    type: "website",
  },
  title: "Blog | RH Healthcare Simulation Centre",
  twitter: {
    card: "summary_large_image",
    title: blogTitle,
    description: blogDescription,
  },
};

export default async function BlogPage() {
  const blogs = await getPublishedBlogs();

  return (
    <div className="bg-white">
      <section className="border-b bg-gray-50 py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Blog
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Practical insights from RH Healthcare Simulation Centre for
            healthcare professionals, educators, and students.
          </p>
        </div>
      </section>

      <section className="container py-12">
        {blogs.length === 0 ? (
          <div className="text-muted-foreground rounded-xl border border-dashed p-12 text-center">
            No blog posts published yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((item) => {
              const imageUrl = getS3AssetUrl(
                item.featuredImage || item.bannerImage,
              );

              return (
                <article
                  key={item.id}
                  className="bg-card overflow-hidden rounded-xl border"
                >
                  {imageUrl && (
                    <Link href={blogPath(item.slug)}>
                      <Image
                        src={imageUrl}
                        alt={item.title}
                        width={1000}
                        height={1000}
                        className="aspect-[16/9] w-full object-cover"
                      />
                    </Link>
                  )}
                  <div className="space-y-4 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.category && (
                        <Badge variant="secondary">{item.category}</Badge>
                      )}
                      {item.isFeatured && <Badge>Featured</Badge>}
                    </div>
                    <div>
                      <Link href={blogPath(item.slug)}>
                        <h2 className="hover:text-primary line-clamp-2 text-xl leading-tight font-semibold">
                          {item.title}
                        </h2>
                      </Link>
                      {item.shortDescription && (
                        <p className="text-muted-foreground mt-3 line-clamp-3 text-sm leading-6">
                          {item.shortDescription}
                        </p>
                      )}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <CalendarDays className="h-4 w-4" />
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString()
                        : new Date(item.createdAt).toLocaleDateString()}
                      <span>by {item.authorName}</span>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={blogPath(item.slug)}>
                        Read more
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
