import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCourse, getCourseItems } from "@/actions/courseAdminActions";
import { CourseForm } from "@/components/admin/CourseForm";
import { CourseItemsManager } from "@/components/admin/CourseItemsManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCourseDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const { tab } = await searchParams;
  const selected = tab === "items" ? "items" : "information";
  const [record, items] = await Promise.all([getAdminCourse(id), getCourseItems(id)]);
  if (!record) notFound();
  return <div className="space-y-5"><div><Button asChild variant="ghost" className="mb-2 px-0"><Link href="/admin/course"><ArrowLeft className="mr-2 size-4" />Back to courses</Link></Button><h1 className="text-2xl font-bold">{record.title}</h1><p className="text-sm text-muted-foreground">Edit course details and course items separately.</p></div>
    <div className="flex border-b"><Tab href={`/admin/course/${id}?tab=information`} active={selected === "information"}>Course information</Tab><Tab href={`/admin/course/${id}?tab=items`} active={selected === "items"}>Course items ({items.length})</Tab></div>
    <div className="rounded-md border bg-white p-5">{selected === "information" ? <CourseForm initialData={record} /> : <CourseItemsManager courseId={id} items={items} />}</div>
  </div>;
}

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return <Link href={href} className={`border-b-2 px-4 py-3 text-sm font-medium ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{children}</Link>;
}
