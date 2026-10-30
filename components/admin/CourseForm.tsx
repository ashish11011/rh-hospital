"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCourse,
  CourseInput,
  updateCourse,
} from "@/actions/courseAdminActions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { getPresignedUrl } from "@/actions/uploadAction";
import { publicAssetUrl, publicAssetKey } from "@/lib/publicAsset";

const list = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

export function CourseForm({
  initialData,
  onSaved,
}: {
  initialData?: any;
  onSaved?: (id: string) => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    content: initialData?.content ?? "",
    currency: initialData?.currency ?? "INR",
    price: initialData?.price ?? 0,
    iosPrice: initialData?.iosPrice ?? "",
    iosProductId: initialData?.iosProductId ?? "",
    isActive: initialData?.isActive ?? true,
    bannerImageUrl: publicAssetKey(initialData?.bannerImageUrl ?? ""),
    courseHours: initialData?.courseHours ?? 0,
    courseDuration: initialData?.courseDuration ?? "",
    totalLectures: initialData?.totalLectures ?? 0,
    slug: initialData?.slug ?? "",
    courseOverview: initialData?.courseOverview ?? "",
    whatYouWillLearn: initialData?.whatYouWillLearn?.join("\n") ?? "",
    skillsAcquired: initialData?.skillsAcquired?.join("\n") ?? "",
  });
  const set = (key: string, value: string | number | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function uploadBanner(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file || uploading || saving) return;
    setUploadError("");
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.");
      input.value = "";
      return;
    }

    setUploading(true);
    try {
      const { uploadUrl, key, error } = await getPresignedUrl(
        file.name,
        file.type,
        "courses/banners",
      );
      if (error || !uploadUrl || !key)
        throw new Error(error || "Unable to prepare banner upload.");
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!response.ok)
        throw new Error("Unable to upload banner. Please try again.");
      set("bannerImageUrl", key);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Unable to upload banner. Please try again.",
      );
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving || uploading) return;
    if (!form.bannerImageUrl) {
      setUploadError("Please upload a banner image before saving the course.");
      return;
    }
    setSaving(true);
    try {
      const data: CourseInput = {
        ...form,
        price: Number(form.price),
        iosPrice:
          String(form.iosPrice).trim() === "" ? null : Number(form.iosPrice),
        iosProductId: form.iosProductId.trim() || null,
        courseHours: Number(form.courseHours),
        totalLectures: Number(form.totalLectures),
        whatYouWillLearn: list(form.whatYouWillLearn),
        skillsAcquired: list(form.skillsAcquired),
      };
      if (initialData?.id) {
        await updateCourse(initialData.id, data);
        onSaved?.(initialData.id);
      } else {
        const created = await createCourse(data);
        onSaved?.(created.id);
      }
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to save course");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title">
          <Input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </Field>
        <Field label="Slug">
          <Input
            required
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="course-name"
          />
        </Field>
      </div>
      <Field label="Description">
        <Textarea
          required
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>
      <Field label="Course content">
        <Textarea
          value={form.content}
          onChange={(e) => set("content", e.target.value)}
          className="min-h-32"
        />
      </Field>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Price">
          <Input
            type="number"
            min="0"
            required
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
          />
        </Field>
        <Field label="Currency">
          <Input
            required
            value={form.currency}
            onChange={(e) => set("currency", e.target.value)}
          />
        </Field>
        <Field label="Duration">
          <Input
            value={form.courseDuration}
            onChange={(e) => set("courseDuration", e.target.value)}
            placeholder="6 weeks"
          />
        </Field>
        <Field label="Course hours">
          <Input
            type="number"
            min="0"
            value={form.courseHours}
            onChange={(e) => set("courseHours", e.target.value)}
          />
        </Field>
        <Field label="Total lectures">
          <Input
            type="number"
            min="0"
            value={form.totalLectures}
            onChange={(e) => set("totalLectures", e.target.value)}
          />
        </Field>
      </div>
      <fieldset className="space-y-3 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">
          iOS App Store purchase
        </legend>
        <p className="text-muted-foreground text-sm">
          Leave both fields empty to disable new iOS purchases. Set the matching
          price and non-consumable product in App Store Connect too; saving here
          does not change Apple's price.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={`iOS price (${form.currency || "INR"})`}>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={form.iosPrice}
              onChange={(e) => set("iosPrice", e.target.value)}
              placeholder="1499.00"
            />
          </Field>
          <Field label="iOS product ID">
            <Input
              value={form.iosProductId}
              maxLength={255}
              autoCapitalize="none"
              spellCheck={false}
              onChange={(e) => set("iosProductId", e.target.value)}
              placeholder="com.rhhealthcare.course.nrp"
            />
          </Field>
        </div>
      </fieldset>
      <Field label="Course overview">
        <Textarea
          value={form.courseOverview}
          onChange={(e) => set("courseOverview", e.target.value)}
        />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="What students will learn (one per line)">
          <Textarea
            value={form.whatYouWillLearn}
            onChange={(e) => set("whatYouWillLearn", e.target.value)}
          />
        </Field>
        <Field label="Skills acquired (one per line)">
          <Textarea
            value={form.skillsAcquired}
            onChange={(e) => set("skillsAcquired", e.target.value)}
          />
        </Field>
      </div>
      <div className="space-y-2">
        <Label htmlFor="course-banner-upload">Banner image</Label>
        <Input
          id="course-banner-upload"
          type="file"
          accept="image/*"
          disabled={uploading || saving}
          onChange={uploadBanner}
          aria-describedby="course-banner-status"
        />
        <p
          id="course-banner-status"
          role="status"
          className="text-muted-foreground text-sm"
        >
          {uploading
            ? "Uploading banner…"
            : "Choose an image for the course banner."}
        </p>
        {uploadError && (
          <p role="alert" className="text-destructive text-sm">
            {uploadError}
          </p>
        )}
        {form.bannerImageUrl && (
          <a
            href={publicAssetUrl(form.bannerImageUrl)}
            target="_blank"
            rel="noreferrer"
            className="block"
          >
            <Image
              src={publicAssetUrl(form.bannerImageUrl)}
              alt="Course banner preview"
              width={1200}
              height={630}
              className="max-h-64 w-full rounded-md border object-contain"
            />
          </a>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="course-active"
          checked={form.isActive}
          onCheckedChange={(value) => set("isActive", value === true)}
        />
        <Label htmlFor="course-active">Active</Label>
      </div>
      <div className="flex justify-end">
        <Button disabled={saving || uploading || !form.bannerImageUrl}>
          {saving
            ? "Saving…"
            : initialData
              ? "Save course information"
              : "Create course"}
        </Button>
      </div>
    </form>
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
