"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/RichTextEditor";
import { getPresignedUrl } from "@/actions/uploadAction";
import { createWorkshop, updateWorkshop } from "@/actions/workshopActions";
import { Plus, Pencil } from "lucide-react";
import { Checkbox } from "../ui/checkbox";

export function WorkshopFormDialog({
  initialData,
  trigger
}: {
  initialData?: any;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [startTime, setStartTime] = useState(initialData ? new Date(initialData.startTime).toISOString().slice(0, 16) : "");
  const [endTime, setEndTime] = useState(initialData ? new Date(initialData.endTime).toISOString().slice(0, 16) : "");
  const [onlinePrice, setOnlinePrice] = useState(initialData?.onlinePrice || 0);
  const [offlinePrice, setOfflinePrice] = useState(initialData?.offlinePrice || 0);
  const [file, setFile] = useState<File | null>(null);
  const [isCompleted, setIsCompleted] = useState(initialData?.isCompleted || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let bannerImageUrl = initialData?.bannerImage;

      if (file) {
        const presignedResult = await getPresignedUrl(file.name, file.type);

        if (presignedResult.error || !presignedResult.uploadUrl) {
          alert(presignedResult.error || "Failed to get upload URL");
          setLoading(false);
          return;
        }

        const uploadResponse = await fetch(presignedResult.uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image directly to S3");
        }

        bannerImageUrl = presignedResult.url;
      }

      const workshopData = {
        name,
        description,
        content,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        onlinePrice: Number(onlinePrice),
        offlinePrice: Number(offlinePrice),
        isCompleted,
        ...(bannerImageUrl && { bannerImage: bannerImageUrl }),
      };

      if (initialData?.id) {
        await updateWorkshop(initialData.id, workshopData);
      } else {
        await createWorkshop(workshopData as any);
      }

      setOpen(false);

      // Reset if creating new
      if (!initialData) {
        setName("");
        setDescription("");
        setContent("");
        setStartTime("");
        setEndTime("");
        setOnlinePrice(0);
        setOfflinePrice(0);
        setFile(null);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Workshop
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl! w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Workshop" : "Create Workshop"}</DialogTitle>
          <DialogDescription>
            Fill out the details below to {initialData ? "update" : "create"} a workshop.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="flex items-center gap-2">
            <Checkbox id="iscompleted" checked={isCompleted} onCheckedChange={setIsCompleted} />
            <Label htmlFor="iscompleted">Workshop Completed</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Workshop Name</Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Next.js Mastery"
              />
            </div>
            <div className="space-y-2">
              <Label>Banner Image (Upload)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {initialData?.bannerImage && !file && (
                <p className="text-sm text-gray-500">Current file exists. Uploading new replaces it.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Short Description</Label>
            <Textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief summary of what this workshop covers..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                required
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                required
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Online Price (INR)</Label>
              <Input
                required
                type="number"
                value={onlinePrice}
                onChange={(e) => setOnlinePrice(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Offline Price (INR)</Label>
              <Input
                required
                type="number"
                value={offlinePrice}
                onChange={(e) => setOfflinePrice(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Content (Rich Text)</Label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          <div className="flex justify-end gap-4 pt-10">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Workshop"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
