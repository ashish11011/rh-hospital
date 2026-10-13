"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/RichTextEditor";
import { getPresignedUrl } from "@/actions/uploadAction";
import { createWorkshop, updateWorkshop } from "@/actions/workshopActions";
import { Plus, Pencil } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { getS3AssetUrl } from "@/lib/s3Asset";
import Image from "next/image";
import { publicMediaHtml } from "@/lib/publicAsset";
import {
  formatWorkshopInput,
  parseWorkshopInput,
} from "@/helper/workshopDateTime";

export function WorkshopFormDialog({
  initialData,
  trigger,
}: {
  initialData?: any;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [content, setContent] = useState(publicMediaHtml(initialData?.content));
  const [startTime, setStartTime] = useState(
    initialData ? formatWorkshopInput(initialData.startTime) : "",
  );
  const [endTime, setEndTime] = useState(
    initialData ? formatWorkshopInput(initialData.endTime) : "",
  );
  const [onlinePrice, setOnlinePrice] = useState(initialData?.onlinePrice || 0);
  const [offlinePrice, setOfflinePrice] = useState(
    initialData?.offlinePrice || 0,
  );
  const [file, setFile] = useState<File | null>(null);
  const [isCompleted, setIsCompleted] = useState(
    initialData?.isCompleted || false,
  );
  const currentBannerPreviewUrl = getS3AssetUrl(initialData?.bannerImage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const workshopStart = parseWorkshopInput(startTime);
      const workshopEnd = parseWorkshopInput(endTime);
      if (workshopEnd <= workshopStart) {
        throw new Error("End time must be after start time.");
      }
      let bannerImageKey = initialData?.bannerImage;

      if (file) {
        const presignedResult = await getPresignedUrl(
          file.name,
          file.type,
          "workshops/banner",
        );

        if (
          presignedResult.error ||
          !presignedResult.uploadUrl ||
          !presignedResult.key
        ) {
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

        bannerImageKey = presignedResult.key;
      }

      const workshopData = {
        name,
        description,
        content,
        startTime: workshopStart,
        endTime: workshopEnd,
        onlinePrice: Number(onlinePrice),
        offlinePrice: Number(offlinePrice),
        isCompleted,
        ...(bannerImageKey && { bannerImage: bannerImageKey }),
      };

      const result = initialData?.id
        ? await updateWorkshop(initialData.id, workshopData)
        : await createWorkshop(workshopData);
      if (result.error) throw new Error(result.error);

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
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Workshop
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-full max-w-5xl! overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Workshop" : "Create Workshop"}
          </DialogTitle>
          <DialogDescription>
            Fill out the details below to {initialData ? "update" : "create"} a
            workshop.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="iscompleted"
              checked={isCompleted}
              onCheckedChange={setIsCompleted}
            />
            <Label htmlFor="iscompleted">Workshop Completed</Label>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              {currentBannerPreviewUrl && !file && (
                <div className="space-y-2">
                  <Image
                    width={400}
                    height={400}
                    src={currentBannerPreviewUrl}
                    alt="Current workshop banner"
                    className="h-24 w-40 rounded-md border object-cover"
                  />
                  <p className="text-sm text-gray-500">
                    Current file exists. Uploading new replaces it.
                  </p>
                </div>
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Time (IST)</Label>
              <Input
                required
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time (IST)</Label>
              <Input
                required
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
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
