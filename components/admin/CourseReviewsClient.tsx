"use client";

import { useState } from "react";
import { deleteCourseReview, updateCourseReviewApproval } from "@/actions/courseAdminActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Star, Trash2, X } from "lucide-react";

export function CourseReviewsClient({ reviews }: { reviews: any[] }) {
  const [saving, setSaving] = useState<string | null>(null);

  async function setApproval(id: string, isApproved: boolean) {
    setSaving(id);
    try {
      await updateCourseReviewApproval(id, isApproved);
    } catch {
      alert("Unable to update review");
    } finally {
      setSaving(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this course review?")) return;

    setSaving(id);
    try {
      await deleteCourseReview(id);
    } catch {
      alert("Unable to delete review");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Course reviews</h1>
        <p className="text-sm text-muted-foreground">Approve, reject, or delete submitted course reviews.</p>
      </div>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Review</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No course reviews found.</TableCell>
              </TableRow>
            ) : reviews.map((item) => (
              <TableRow key={item.id} className="align-top">
                <TableCell className="max-w-xl">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className={`size-4 ${index < item.rating ? "fill-current" : ""}`} />
                    ))}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{item.feedback}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.createdAt ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(item.createdAt)) : "N/A"}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{item.courseTitle}</div>
                  <div className="text-xs text-muted-foreground">{item.courseSlug}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{item.userName}</div>
                  <div className="text-sm text-muted-foreground">{item.userEmail}</div>
                  <div className="text-sm text-muted-foreground">{item.userMobileNumber || "N/A"}</div>
                  <div className="text-xs text-muted-foreground">{item.userDesignation} {item.userInstituteName ? `, ${item.userInstituteName}` : ""}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={item.isApproved ? "default" : "secondary"}>
                    {item.isApproved ? "Approved" : "Not approved"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      title="Approve"
                      disabled={saving === item.id}
                      onClick={() => setApproval(item.id, true)}>
                      <Check className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      title="Reject"
                      disabled={saving === item.id}
                      onClick={() => setApproval(item.id, false)}>
                      <X className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      title="Delete"
                      disabled={saving === item.id}
                      onClick={() => remove(item.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
