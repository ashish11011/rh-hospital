"use client";

import LinkExtension from "@tiptap/extension-link";
import { Table as TableExtension } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import UnderlineExtension from "@tiptap/extension-underline";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  createBlog,
  updateBlog,
  type BlogInput,
  type BlogStatus,
} from "@/actions/blogAdminActions";
import { getBlogImagePresignedUrl } from "@/actions/uploadAction";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { normalizeBlogSlug } from "@/lib/blogUtils";
import { getS3AssetUrl } from "@/lib/s3Asset";
import { cn } from "@/lib/utils";
import {
  Bold,
  Columns2,
  Columns3Cog,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Rows2,
  Rows3,
  Table as TableIcon,
  Trash2,
  Underline,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

function toDateTimeLocal(value?: Date | string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function hasContent(value: string) {
  return (
    value
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim().length > 0
  );
}

export function BlogForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<
    "featuredImage" | "bannerImage" | null
  >(null);
  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    shortDescription: initialData?.shortDescription ?? "",
    content: initialData?.content ?? "",
    authorName: initialData?.authorName ?? "RH Healthcare Simulation Centre",
    featuredImage: initialData?.featuredImage ?? "",
    bannerImage: initialData?.bannerImage ?? "",
    metaTitle: initialData?.metaTitle ?? "",
    metaDescription: initialData?.metaDescription ?? "",
    metaKeywords: initialData?.metaKeywords ?? "",
    category: initialData?.category ?? "",
    tags: initialData?.tags?.join(", ") ?? "",
    status: (initialData?.status ?? "draft") as BlogStatus,
    isFeatured: initialData?.isFeatured ?? false,
    publishedAt: toDateTimeLocal(initialData?.publishedAt),
  });

  const set = (key: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function uploadImage(
    field: "featuredImage" | "bannerImage",
    file?: File | null,
  ) {
    if (!file) return;
    setUploadingField(field);

    try {
      const presignedResult = await getBlogImagePresignedUrl(
        file.name,
        file.type,
      );

      if (
        presignedResult.error ||
        !presignedResult.uploadUrl ||
        !presignedResult.key
      ) {
        throw new Error(presignedResult.error || "Failed to create upload URL");
      }

      const uploadResponse = await fetch(presignedResult.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image to S3");
      }

      set(field, presignedResult.key);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to upload image",
      );
    } finally {
      setUploadingField(null);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!hasContent(form.content)) {
      toast.error("Please add blog content");
      return;
    }

    setSaving(true);

    try {
      const data: BlogInput = {
        ...form,
        publishedAt: form.publishedAt ? new Date(form.publishedAt) : null,
      };

      if (initialData?.id) {
        await updateBlog(initialData.id, data);
        toast.success("Blog updated");
      } else {
        const created = await createBlog(data);
        toast.success("Blog created");
        router.push(`/admin/blog/${created.id}`);
      }

      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save blog",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title">
          <Input
            required
            value={form.title}
            onChange={(event) => {
              const title = event.target.value;
              setForm((current) => ({
                ...current,
                title,
                slug:
                  initialData?.id || current.slug
                    ? current.slug
                    : normalizeBlogSlug(title),
              }));
            }}
          />
        </Field>
        <Field label="Slug">
          <Input
            required
            value={form.slug}
            onChange={(event) =>
              set("slug", normalizeBlogSlug(event.target.value))
            }
            placeholder="blog-post-title"
          />
        </Field>
      </div>

      <Field label="Short description">
        <Textarea
          value={form.shortDescription}
          onChange={(event) => set("shortDescription", event.target.value)}
          className="min-h-24"
        />
      </Field>

      <Field label="Content">
        <RichTextEditor
          value={form.content}
          onChange={(value) => set("content", value)}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Author">
          <Input
            required
            value={form.authorName}
            onChange={(event) => set("authorName", event.target.value)}
          />
        </Field>
        <Field label="Category">
          <Input
            value={form.category}
            onChange={(event) => set("category", event.target.value)}
          />
        </Field>
        <Field label="Tags">
          <Input
            value={form.tags}
            onChange={(event) => set("tags", event.target.value)}
            placeholder="Nursing, Simulation"
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Featured image">
          <ImageUploadField
            value={form.featuredImage}
            uploading={uploadingField === "featuredImage"}
            onChange={(value) => set("featuredImage", value)}
            onUpload={(file) => uploadImage("featuredImage", file)}
          />
        </Field>
        <Field label="Banner image">
          <ImageUploadField
            value={form.bannerImage}
            uploading={uploadingField === "bannerImage"}
            onChange={(value) => set("bannerImage", value)}
            onUpload={(file) => uploadImage("bannerImage", file)}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Status">
          <Select
            value={form.status}
            onValueChange={(value: BlogStatus) => set("status", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Published at">
          <Input
            type="datetime-local"
            value={form.publishedAt}
            onChange={(event) => set("publishedAt", event.target.value)}
          />
        </Field>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="is-featured"
          checked={form.isFeatured}
          onCheckedChange={(value) => set("isFeatured", value === true)}
        />
        <Label htmlFor="is-featured">Featured blog</Label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Meta title">
          <Input
            value={form.metaTitle}
            onChange={(event) => set("metaTitle", event.target.value)}
          />
        </Field>
        <Field label="Meta keywords">
          <Input
            value={form.metaKeywords}
            onChange={(event) => set("metaKeywords", event.target.value)}
          />
        </Field>
      </div>

      <Field label="Meta description">
        <Textarea
          value={form.metaDescription}
          onChange={(event) => set("metaDescription", event.target.value)}
        />
      </Field>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/blog")}
        >
          Cancel
        </Button>
        <Button disabled={saving}>
          {saving ? "Saving..." : initialData?.id ? "Save blog" : "Create blog"}
        </Button>
      </div>
    </form>
  );
}

function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        link: false,
        underline: false,
      }),
      UnderlineExtension,
      LinkExtension.configure({
        autolink: true,
        defaultProtocol: "https",
        openOnClick: false,
      }),
      TableExtension.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "blog-rich-content min-h-72 max-w-none px-4 py-3 outline-none focus:outline-none",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className="bg-background overflow-hidden rounded-md border">
      <RichTextToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function RichTextToolbar({ editor }: { editor: Editor | null }) {
  const headingButtons = [
    { level: 1, label: "H1", Icon: Heading1 },
    { level: 2, label: "H2", Icon: Heading2 },
    { level: 3, label: "H3", Icon: Heading3 },
    { level: 4, label: "H4", Icon: Heading4 },
    { level: 5, label: "H5", Icon: Heading5 },
    { level: 6, label: "H6", Icon: Heading6 },
  ] as const;

  const setLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter link URL", previousUrl || "");

    if (url === null) return;

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const canUseTableControls = Boolean(editor?.isActive("table"));

  return (
    <div className="bg-muted/40 flex flex-wrap items-center gap-2 border-b p-2">
      {headingButtons.map(({ level, label, Icon }) => (
        <ToolbarButton
          key={level}
          active={editor?.isActive("heading", { level })}
          disabled={!editor}
          label={label}
          onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
        >
          <Icon />
        </ToolbarButton>
      ))}
      <ToolbarButton
        active={editor?.isActive("bold")}
        disabled={!editor}
        label="Bold"
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        <Bold />
      </ToolbarButton>
      <ToolbarButton
        active={editor?.isActive("italic")}
        disabled={!editor}
        label="Italic"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <Italic />
      </ToolbarButton>
      <ToolbarButton
        active={editor?.isActive("underline")}
        disabled={!editor}
        label="Underline"
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
      >
        <Underline />
      </ToolbarButton>
      <ToolbarButton
        active={editor?.isActive("bulletList")}
        disabled={!editor}
        label="Bullet list"
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
      >
        <List />
      </ToolbarButton>
      <ToolbarButton
        active={editor?.isActive("orderedList")}
        disabled={!editor}
        label="Numbered list"
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered />
      </ToolbarButton>
      <ToolbarButton
        active={editor?.isActive("link")}
        disabled={!editor}
        label="Link"
        onClick={setLink}
      >
        <LinkIcon />
      </ToolbarButton>
      <ToolbarButton
        disabled={!editor}
        label="Insert table"
        onClick={() =>
          editor
            ?.chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        <TableIcon />
      </ToolbarButton>
      <ToolbarButton
        disabled={!editor || !canUseTableControls}
        label="Add row"
        onClick={() => editor?.chain().focus().addRowAfter().run()}
      >
        <Rows3 />
      </ToolbarButton>
      <ToolbarButton
        disabled={!editor || !canUseTableControls}
        label="Add column"
        onClick={() => editor?.chain().focus().addColumnAfter().run()}
      >
        <Columns2 />
      </ToolbarButton>
      <ToolbarButton
        disabled={!editor || !canUseTableControls}
        label="Delete row"
        onClick={() => editor?.chain().focus().deleteRow().run()}
      >
        <Rows2 />
      </ToolbarButton>
      <ToolbarButton
        disabled={!editor || !canUseTableControls}
        label="Delete column"
        onClick={() => editor?.chain().focus().deleteColumn().run()}
      >
        <Columns3Cog />
      </ToolbarButton>
      <ToolbarButton
        disabled={!editor || !canUseTableControls}
        label="Delete table"
        onClick={() => editor?.chain().focus().deleteTable().run()}
      >
        <Trash2 />
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  active,
  children,
  disabled,
  label,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "secondary" : "outline"}
      disabled={disabled}
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn("h-8 w-8 p-0", active && "ring-primary/20 ring-2")}
    >
      {children}
    </Button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ImageUploadField({
  value,
  uploading,
  onChange,
  onUpload,
}: {
  value: string;
  uploading: boolean;
  onChange: (value: string) => void;
  onUpload: (file?: File | null) => void;
}) {
  const previewUrl = getS3AssetUrl(value);

  return (
    <div className="space-y-2">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="blogs/image-name.jpg"
      />
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(event) => onUpload(event.target.files?.[0] || null)}
        />
        {uploading && (
          <span className="text-muted-foreground text-sm">Uploading...</span>
        )}
      </div>
      {value && (
        <div className="bg-muted/30 space-y-2 rounded-md border p-3">
          <p className="text-muted-foreground text-xs break-all">
            Stored key: {value}
          </p>
          <p className="text-muted-foreground text-xs break-all">
            Preview URL: {previewUrl}
          </p>
          <Image
            width={1200}
            height={1000}
            src={previewUrl}
            alt="Blog upload preview"
            className="h-auto w-full rounded-md object-cover"
          />
        </div>
      )}
    </div>
  );
}
