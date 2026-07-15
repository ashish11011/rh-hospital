import { BlogForm } from "@/components/admin/blog/BlogForm";
import { requireAdmin } from "@/lib/adminAuth";

export default async function NewBlogPage() {
  await requireAdmin("blog");

  return (
    <div className="w-full space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Write and publish a new blog post.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <BlogForm />
      </div>
    </div>
  );
}
