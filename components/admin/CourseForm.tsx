"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse, CourseInput, updateCourse } from "@/actions/courseAdminActions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CLOUDFRONT_URL, cloudfrontAssetUrl } from "@/lib/cloudfront";

const list = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);

export function CourseForm({ initialData, onSaved }: { initialData?: any; onSaved?: (id: string) => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: initialData?.title ?? "", description: initialData?.description ?? "", content: initialData?.content ?? "",
    currency: initialData?.currency ?? "INR", price: initialData?.price ?? 0, isActive: initialData?.isActive ?? true,
    bannerImageUrl: initialData?.bannerImageUrl ?? "", courseHours: initialData?.courseHours ?? 0,
    courseDuration: initialData?.courseDuration ?? "", totalLectures: initialData?.totalLectures ?? 0,
    slug: initialData?.slug ?? "", courseOverview: initialData?.courseOverview ?? "",
    whatYouWillLearn: initialData?.whatYouWillLearn?.join("\n") ?? "", skillsAcquired: initialData?.skillsAcquired?.join("\n") ?? "",
  });
  const set = (key: string, value: string | number | boolean) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const data: CourseInput = { ...form, price: Number(form.price), courseHours: Number(form.courseHours), totalLectures: Number(form.totalLectures), whatYouWillLearn: list(form.whatYouWillLearn), skillsAcquired: list(form.skillsAcquired) };
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
    } finally { setSaving(false); }
  }

  return <form onSubmit={submit} className="space-y-5">
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Title"><Input required value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
      <Field label="Slug"><Input required value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="course-name" /></Field>
    </div>
    <Field label="Description"><Textarea required value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
    <Field label="Course content"><Textarea value={form.content} onChange={(e) => set("content", e.target.value)} className="min-h-32" /></Field>
    <div className="grid gap-4 md:grid-cols-3">
      <Field label="Price"><Input type="number" min="0" required value={form.price} onChange={(e) => set("price", e.target.value)} /></Field>
      <Field label="Currency"><Input required value={form.currency} onChange={(e) => set("currency", e.target.value)} /></Field>
      <Field label="Duration"><Input value={form.courseDuration} onChange={(e) => set("courseDuration", e.target.value)} placeholder="6 weeks" /></Field>
      <Field label="Course hours"><Input type="number" min="0" value={form.courseHours} onChange={(e) => set("courseHours", e.target.value)} /></Field>
      <Field label="Total lectures"><Input type="number" min="0" value={form.totalLectures} onChange={(e) => set("totalLectures", e.target.value)} /></Field>
    </div>
    <Field label="Course overview"><Textarea value={form.courseOverview} onChange={(e) => set("courseOverview", e.target.value)} /></Field>
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="What students will learn (one per line)"><Textarea value={form.whatYouWillLearn} onChange={(e) => set("whatYouWillLearn", e.target.value)} /></Field>
      <Field label="Skills acquired (one per line)"><Textarea value={form.skillsAcquired} onChange={(e) => set("skillsAcquired", e.target.value)} /></Field>
    </div>
    <Field label="Banner image key">
      <div className="flex rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring"><span className="flex items-center border-r bg-muted px-3 text-sm text-muted-foreground">{CLOUDFRONT_URL}/</span><Input required value={form.bannerImageUrl} onChange={(e) => set("bannerImageUrl", e.target.value)} placeholder="courses/banner.jpg" className="border-0 focus-visible:ring-0" /></div>
      {form.bannerImageUrl && <a href={cloudfrontAssetUrl(form.bannerImageUrl)} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Preview banner</a>}
    </Field>
    <div className="flex items-center gap-2"><Checkbox id="course-active" checked={form.isActive} onCheckedChange={(value) => set("isActive", value === true)} /><Label htmlFor="course-active">Active</Label></div>
    <div className="flex justify-end"><Button disabled={saving}>{saving ? "Saving…" : initialData ? "Save course information" : "Create course"}</Button></div>
  </form>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
