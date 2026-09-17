"use client";

import { useState } from "react";
import { updateCourseEnrolmentStatus } from "@/actions/courseAdminActions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statuses = ["enrolled", "pending", "expired", "refunded"] as const;

export function CourseEnrolmentsClient({ enrolments }: { enrolments: any[] }) {
  const [saving, setSaving] = useState<string | null>(null);
  async function change(id: string, status: typeof statuses[number]) {
    setSaving(id);
    try { await updateCourseEnrolmentStatus(id, status); } catch { alert("Unable to update status"); } finally { setSaving(null); }
  }
  return <div className="space-y-4"><div><h1 className="text-2xl font-bold">Course enrolments</h1><p className="text-sm text-muted-foreground">Users who have enrolled in a course. Update their access status here.</p></div><div className="rounded-md border bg-white"><Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Contact</TableHead><TableHead>Course</TableHead><TableHead>Enrolled on</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
    {enrolments.length === 0 ? <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No course enrolments found.</TableCell></TableRow> : enrolments.map((item) => <TableRow key={item.id}><TableCell><div className="font-medium">{item.userName}</div><div className="text-sm text-muted-foreground">{item.userEmail}</div></TableCell><TableCell>{item.mobileNumber || "—"}</TableCell><TableCell>{item.courseTitle}</TableCell><TableCell>{item.enrolledAt ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(item.enrolledAt)) : "—"}</TableCell><TableCell><Select disabled={saving === item.id} value={item.status} onValueChange={(value) => change(item.id, value as typeof statuses[number])}><SelectTrigger className="w-36 capitalize"><SelectValue /></SelectTrigger><SelectContent>{statuses.map((status) => <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>)}</SelectContent></Select></TableCell></TableRow>)}
  </TableBody></Table></div></div>;
}
