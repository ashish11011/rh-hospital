"use client";

import { useState } from "react";
import { createCourseItem, deleteCourseItem, updateCourseItem } from "@/actions/courseAdminActions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { CLOUDFRONT_URL, cloudfrontAssetUrl } from "@/lib/cloudfront";

export function CourseItemsManager({ courseId, items }: { courseId: string; items: any[] }) {
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  async function remove(id: string) {
    if (!confirm("Delete this course item?")) return;
    setDeleting(id);
    try { await deleteCourseItem(id, courseId); } catch { alert("Unable to delete item"); } finally { setDeleting(null); }
  }
  return <div className="space-y-4">
    <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Course items</h2><p className="text-sm text-muted-foreground">Manage videos, documents and other lessons independently.</p></div><Button onClick={() => setCreating(true)}><Plus className="mr-2 size-4" />Add item</Button></div>
    <div className="rounded-md border"><Table><TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Duration</TableHead><TableHead>Media URL</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
      {items.length === 0 ? <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No course items yet.</TableCell></TableRow> : items.map((item) => <TableRow key={item.id}><TableCell>{item.priority}</TableCell><TableCell className="font-medium">{item.title || "Untitled"}</TableCell><TableCell>{item.mediaType}</TableCell><TableCell>{item.duration || "—"}</TableCell><TableCell><a className="block max-w-64 truncate text-primary underline" href={cloudfrontAssetUrl(item.mediaUrl)} target="_blank" rel="noreferrer">{item.mediaUrl}</a></TableCell><TableCell><div className="flex justify-end gap-2"><Button variant="outline" size="icon" onClick={() => setEditing(item)}><Pencil className="size-4" /></Button><Button variant="destructive" size="icon" disabled={deleting === item.id} onClick={() => remove(item.id)}><Trash2 className="size-4" /></Button></div></TableCell></TableRow>)}
    </TableBody></Table></div>
    <ItemDialog courseId={courseId} open={creating} onOpenChange={setCreating} />
    <ItemDialog courseId={courseId} item={editing} open={Boolean(editing)} onOpenChange={(value) => !value && setEditing(null)} />
  </div>;
}

function ItemDialog({ courseId, item, open, onOpenChange }: { courseId: string; item?: any; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{item ? "Edit course item" : "Add course item"}</DialogTitle><DialogDescription>This only changes content associated with this course.</DialogDescription></DialogHeader>{open && <ItemForm courseId={courseId} item={item} close={() => onOpenChange(false)} />}</DialogContent></Dialog>;
}

function ItemForm({ courseId, item, close }: { courseId: string; item?: any; close: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: item?.title ?? "", mediaUrl: item?.mediaUrl ?? "", mediaType: item?.mediaType ?? "video", duration: item?.duration ?? "", priority: item?.priority ?? 0 });
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true);
    try {
      const data = { ...form, courseId, priority: Number(form.priority) };
      if (item?.id) await updateCourseItem(item.id, data); else await createCourseItem(data);
      close();
    } catch (error) { alert(error instanceof Error ? error.message : "Unable to save item"); } finally { setSaving(false); }
  }
  return <form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></div><div className="space-y-2"><Label>CloudFront media key</Label><div className="flex rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring"><span className="flex items-center border-r bg-muted px-3 text-sm text-muted-foreground">{CLOUDFRONT_URL}/</span><Input required value={form.mediaUrl} onChange={(e) => set("mediaUrl", e.target.value)} placeholder="courses/lesson-01.mp4" className="border-0 focus-visible:ring-0" /></div>{form.mediaUrl && <a href={cloudfrontAssetUrl(form.mediaUrl)} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Open media</a>}</div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Media type</Label><Select value={form.mediaType} onValueChange={(value) => set("mediaType", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="video">Video</SelectItem><SelectItem value="document">Document</SelectItem><SelectItem value="audio">Audio</SelectItem><SelectItem value="link">Link</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Duration</Label><Input value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="12:30" /></div></div><div className="space-y-2"><Label>Display order</Label><Input type="number" value={form.priority} onChange={(e) => set("priority", e.target.value)} /></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button disabled={saving}>{saving ? "Saving…" : "Save item"}</Button></div></form>;
}
