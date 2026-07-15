import { getAdminBlogs, type BlogStatus } from "@/actions/blogAdminActions";
import { BlogDeleteButton } from "@/components/admin/blog/BlogDeleteButton";
import { BlogStatusSelect } from "@/components/admin/blog/BlogStatusSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { blogPath } from "@/lib/blogUtils";
import { requireAdmin } from "@/lib/adminAuth";
import { Edit, Eye, Plus } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const statusVariant = {
  draft: "secondary",
  published: "default",
  archived: "outline",
} as const;

export default async function AdminBlogPage({ searchParams }: PageProps) {
  await requireAdmin("blog");
  const resolvedParams = await searchParams;
  const search = typeof resolvedParams.search === "string" ? resolvedParams.search : "";
  const status = typeof resolvedParams.status === "string" ? resolvedParams.status : "";
  const blogs = await getAdminBlogs({ search, status });

  return (
    <div className="w-full space-y-6 py-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <p className="mt-2 text-muted-foreground">
            Create posts, edit content, and manage publishing status.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="h-4 w-4" />
            New blog
          </Link>
        </Button>
      </div>

      <form className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_180px_auto]">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search blogs"
          className="h-10 rounded-md border bg-background px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={status}
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">/{item.slug}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[item.status]}>
                      {item.status}
                    </Badge>
                    <BlogStatusSelect id={item.id} status={item.status as BlogStatus} />
                  </div>
                </TableCell>
                <TableCell>{item.category || "-"}</TableCell>
                <TableCell>
                  {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell>{item.isFeatured ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {item.status === "published" && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={blogPath(item.slug)} target="_blank">
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </Button>
                    )}
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/blog/${item.id}`}>
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <BlogDeleteButton id={item.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {blogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No blogs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
