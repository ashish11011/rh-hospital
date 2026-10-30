"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "motion/react";
import { CourseItemBanner } from "@/components/course/CourseItemBanner";
import {
  createCourseItem,
  deleteCourseItem,
  updateCourseItem,
  reorderCourseItems,
} from "@/actions/courseAdminActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { COURSE_CLOUDFRONT_URL } from "@/lib/cloudfront";
import { isCourseVideoMedia } from "@/lib/publicAsset";
import { CourseMediaPreview } from "./CourseMediaPreview";
import {
  COURSE_ITEM_ACCESS_TYPES,
  COURSE_ITEM_ACCESS_LABELS,
  type CourseItemAccessType,
} from "@/lib/courseItemAccess";
import type { CourseItemInput } from "@/actions/courseAdminActions";

type CourseItem = CourseItemInput & { id: string };

export function CourseItemsManager({
  courseId,
  items,
  email,
}: {
  courseId: string;
  items: CourseItem[];
  email: string;
}) {
  const [editing, setEditing] = useState<CourseItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [itemOrder, setItemOrder] = useState<string[] | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const orderedItems = itemOrder
    ? [
        ...itemOrder.flatMap((id) =>
          itemsById.get(id) ? [itemsById.get(id)!] : [],
        ),
        ...items.filter((item) => !itemOrder.includes(item.id)),
      ]
    : items;
  const orderedIds = orderedItems.map((item) => item.id);
  const hasOrderChanges = orderedIds.some(
    (id, index) => id !== items[index]?.id,
  );
  const busy = savingOrder || Boolean(deleting) || creating || Boolean(editing);

  function changeOrder(next: string[]) {
    if (busy) return;
    setItemOrder(next);
    setOrderError("");
    setOrderMessage("");
  }

  function moveItem(id: string, direction: -1 | 1) {
    const index = orderedIds.indexOf(id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= orderedIds.length) return;
    const next = [...orderedIds];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    changeOrder(next);
  }

  async function saveOrder() {
    if (busy || !hasOrderChanges) return;
    setSavingOrder(true);
    setOrderError("");
    try {
      await reorderCourseItems(courseId, orderedIds);
      setItemOrder(null);
      setOrderMessage("Course item order saved.");
    } catch (error) {
      setOrderError(
        error instanceof Error
          ? error.message
          : "Unable to save course item order. Please try again.",
      );
    } finally {
      setSavingOrder(false);
    }
  }
  async function remove(id: string) {
    if (!confirm("Delete this course item?")) return;
    setDeleting(id);
    try {
      await deleteCourseItem(id, courseId);
    } catch {
      alert("Unable to delete item");
    } finally {
      setDeleting(null);
    }
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Course items</h2>
          <p className="text-muted-foreground text-sm">
            Drag the handles to arrange items, then save the order. You can also
            focus a handle and use the arrow keys.
          </p>
        </div>
        <Button
          disabled={busy || hasOrderChanges}
          onClick={() => setCreating(true)}
        >
          <Plus className="mr-2 size-4" />
          Add item
        </Button>
      </div>
      {hasOrderChanges && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            disabled={savingOrder}
            onClick={() => {
              setItemOrder(null);
              setOrderError("");
            }}
          >
            Reset order
          </Button>
          <Button disabled={savingOrder} onClick={saveOrder}>
            {savingOrder ? "Saving order…" : "Save order"}
          </Button>
        </div>
      )}
      {orderError && (
        <p role="alert" className="text-destructive text-sm">
          {orderError}
        </p>
      )}
      <p
        role="status"
        aria-live="polite"
        className="text-muted-foreground text-sm"
      >
        {savingOrder
          ? "Saving course item order…"
          : orderMessage ||
            (hasOrderChanges
              ? "Order changed. Save to apply the new priorities."
              : "")}
      </p>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Access</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Media URL</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <Reorder.Group
            as="tbody"
            axis="y"
            values={orderedIds}
            onReorder={changeOrder}
            className="[&_tr:last-child]:border-0"
          >
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-8 text-center"
                >
                  No course items yet.
                </TableCell>
              </TableRow>
            ) : (
              orderedItems.map((item, index) => (
                <SortableCourseItemRow
                  key={item.id}
                  id={item.id}
                  title={item.title || `Item ${index + 1}`}
                  position={index + 1}
                  disabled={busy}
                  onMove={(direction) => moveItem(item.id, direction)}
                >
                  <TableCell>
                    <div className="w-56">
                      <CourseItemBanner title={item.title || ""} />
                    </div>
                  </TableCell>
                  <TableCell>{item.mediaType}</TableCell>
                  <TableCell>
                    {COURSE_ITEM_ACCESS_LABELS[item.accessType ?? "paid"]}
                  </TableCell>
                  <TableCell>{item.duration || "—"}</TableCell>
                  <TableCell>
                    {isCourseVideoMedia(item.mediaUrl, item.mediaType) ? (
                      <CourseMediaPreview
                        courseId={courseId}
                        itemId={item.id}
                        email={email}
                        label={item.mediaUrl}
                      />
                    ) : (
                      <a
                        className="text-primary block max-w-64 truncate underline"
                        href={`/api/course/media/${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.mediaUrl}
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={busy || hasOrderChanges}
                        onClick={() => setEditing(item)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        disabled={busy || hasOrderChanges}
                        onClick={() => remove(item.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </SortableCourseItemRow>
              ))
            )}
          </Reorder.Group>
        </Table>
      </div>
      <ItemDialog
        email={email}
        courseId={courseId}
        open={creating}
        onOpenChange={setCreating}
      />
      <ItemDialog
        email={email}
        courseId={courseId}
        item={editing}
        open={Boolean(editing)}
        onOpenChange={(value) => !value && setEditing(null)}
      />
    </div>
  );
}

function SortableCourseItemRow({
  id,
  title,
  position,
  disabled,
  onMove,
  children,
}: {
  id: string;
  title: string;
  position: number;
  disabled: boolean;
  onMove: (direction: -1 | 1) => void;
  children: React.ReactNode;
}) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item
      as="tr"
      value={id}
      dragListener={false}
      dragControls={dragControls}
      style={{ position: "relative" }}
      className="bg-background hover:bg-muted/50 border-b"
      whileDrag={{ zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            aria-label={`Reorder ${title}`}
            title="Drag to reorder, or use up/down arrow keys"
            className="text-muted-foreground focus-visible:outline-primary cursor-grab touch-none rounded p-1 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
            onPointerDown={(event) => {
              if (!disabled) dragControls.start(event);
            }}
            onKeyDown={(event) => {
              if (disabled || !["ArrowUp", "ArrowDown"].includes(event.key))
                return;
              event.preventDefault();
              onMove(event.key === "ArrowUp" ? -1 : 1);
            }}
          >
            <GripVertical className="size-4" aria-hidden="true" />
          </button>
          <span>{position}</span>
        </div>
      </TableCell>
      {children}
    </Reorder.Item>
  );
}

function ItemDialog({
  courseId,
  item,
  open,
  onOpenChange,
  email,
}: {
  email: string;
  courseId: string;
  item?: CourseItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit course item" : "Add course item"}
          </DialogTitle>
          <DialogDescription>
            This only changes content associated with this course.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <ItemForm
            email={email}
            courseId={courseId}
            item={item}
            close={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ItemForm({
  courseId,
  item,
  close,
  email,
}: {
  email: string;
  courseId: string;
  item?: CourseItem | null;
  close: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: item?.title ?? "",
    mediaUrl: item?.mediaUrl ?? "",
    mediaType: item?.mediaType ?? "video",
    duration: item?.duration ?? "",
    priority: item?.priority ?? 0,
    accessType: item?.accessType ?? "paid",
  });
  const set = (
    key: "title" | "mediaUrl" | "mediaType" | "duration" | "priority",
    value: string,
  ) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, courseId, priority: Number(form.priority) };
      if (item?.id) await updateCourseItem(item.id, data);
      else await createCourseItem(data);
      close();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to save item");
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <CourseItemBanner title={form.title} />
      <div className="space-y-2">
        <Label htmlFor="course-item-access">Item access</Label>
        <Select
          value={form.accessType}
          onValueChange={(value) =>
            setForm((current) => ({
              ...current,
              accessType: value as CourseItemAccessType,
            }))
          }
        >
          <SelectTrigger id="course-item-access">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COURSE_ITEM_ACCESS_TYPES.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "free_for_members"
                  ? "Free for members"
                  : COURSE_ITEM_ACCESS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>CloudFront media key</Label>
        <div className="bg-background focus-within:ring-ring flex rounded-md border focus-within:ring-2">
          <span className="bg-muted text-muted-foreground flex items-center border-r px-3 text-sm">
            {COURSE_CLOUDFRONT_URL}/
          </span>
          <Input
            required
            value={form.mediaUrl}
            onChange={(e) => set("mediaUrl", e.target.value)}
            placeholder="course/videos/lesson-01.mp4"
            className="border-0 focus-visible:ring-0"
          />
        </div>
        {form.mediaUrl &&
          (isCourseVideoMedia(form.mediaUrl, form.mediaType) ? (
            item?.id ? (
              <CourseMediaPreview
                courseId={courseId}
                itemId={item.id}
                email={email}
                label="Preview saved lesson"
              />
            ) : (
              <p className="text-muted-foreground text-xs">
                Save the lesson to preview it.
              </p>
            )
          ) : item?.id ? (
            <a
              href={`/api/course/media/${item.id}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary text-sm underline"
            >
              Open saved document
            </a>
          ) : (
            <p className="text-muted-foreground text-xs">
              Save the lesson to preview it.
            </p>
          ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Media type</Label>
          <Select
            value={form.mediaType}
            onValueChange={(value) => set("mediaType", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="link">Link</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Duration</Label>
          <Input
            value={form.duration}
            onChange={(e) => set("duration", e.target.value)}
            placeholder="12:30"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Display order</Label>
        <Input
          type="number"
          value={form.priority}
          onChange={(e) => set("priority", e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={close}>
          Cancel
        </Button>
        <Button disabled={saving}>{saving ? "Saving…" : "Save item"}</Button>
      </div>
    </form>
  );
}
