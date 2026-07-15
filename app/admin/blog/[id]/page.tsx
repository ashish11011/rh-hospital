import { getAdminBlog } from "@/actions/blogAdminActions";
import { BlogForm } from "@/components/admin/blog/BlogForm";
import { requireAdmin } from "@/lib/adminAuth";
import { notFound } from "next/navigation";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("blog");
  const { id } = await params;
  const blog = await getAdminBlog(id);

  if (!blog) {
    notFound();
  }

  return (
    <div className="w-full space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Update the blog content, SEO metadata, and publishing status.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <BlogForm initialData={blog} />
      </div>
    </div>
  );
}
