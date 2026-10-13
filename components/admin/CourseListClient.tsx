"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteCourse } from "@/actions/courseAdminActions";
import { CourseForm } from "./CourseForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { publicAssetUrl } from "@/lib/publicAsset";

export function CourseListClient({ courses }: { courses: any[] }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  async function remove(id: string) {
    if (!confirm("Delete this course and all associated course items and enrolments?")) return;
    setDeleting(id);
    try { await deleteCourse(id); } catch { alert("Unable to delete course"); } finally { setDeleting(null); }
  }
  return <div className="space-y-4">
    <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Courses</h1><p className="text-sm text-muted-foreground">Manage course information and learning items.</p></div>
      <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><Plus className="mr-2 size-4" />Add course</Button></DialogTrigger><DialogContent className="max-h-[90vh] max-w-5xl! overflow-y-auto"><DialogHeader><DialogTitle>Create course</DialogTitle><DialogDescription>Add the course information. Items can be added after creation.</DialogDescription></DialogHeader><CourseForm onSaved={() => setOpen(false)} /></DialogContent></Dialog>
    </div>
    <div className="rounded-md border bg-white"><Table><TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Slug</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
      {courses.length === 0 ? <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No courses found.</TableCell></TableRow> : courses.map((item) => <TableRow key={item.id}><TableCell><div className="flex items-center gap-3"><img src={publicAssetUrl(item.bannerImageUrl)} alt="" className="h-10 w-16 rounded object-cover" /><span className="font-medium">{item.title}</span></div></TableCell><TableCell>{item.slug}</TableCell><TableCell>{item.currency} {item.price}</TableCell><TableCell>{item.isActive ? "Active" : "Inactive"}</TableCell><TableCell><div className="flex justify-end gap-2"><Button asChild variant="outline" size="sm"><Link href={`/admin/course/${item.id}?tab=information`}><Pencil className="mr-2 size-4" />Manage</Link></Button><Button variant="destructive" size="icon" disabled={deleting === item.id} onClick={() => remove(item.id)}><Trash2 className="size-4" /></Button></div></TableCell></TableRow>)}
    </TableBody></Table></div>
  </div>;
}
