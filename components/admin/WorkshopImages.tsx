"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getPresignedUrl } from "@/actions/uploadAction";
import { getWorkshopImages, addWorkshopImage, deleteWorkshopImage } from "@/actions/workshopActions";
import { Plus, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import axios from "axios";
import { toast } from "sonner";

export function WorkshopImages({
    initialData,
    trigger,
    isCompleted
}: {
    initialData?: any;
    trigger?: React.ReactNode;
    isCompleted: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<any[]>([]);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (open && initialData?.id) {
            loadImages();
        }
    }, [open, initialData?.id]);

    const loadImages = async () => {
        setFetching(true);
        try {
            const data = await getWorkshopImages(initialData.id);
            setImages(data || []);
        } catch (error) {
            console.error("Failed to fetch images", error);
        } finally {
            setFetching(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setLoading(true);

        const files = Array.from(e.target.files);

        try {
            for (const file of files) {
                // Compress image
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(file, options);

                // Get presigned URL
                const { uploadUrl, url, error } = await getPresignedUrl(compressedFile.name, compressedFile.type);
                if (error || !uploadUrl || !url) {
                    toast.error(`Failed to get upload URL for ${file.name}`);
                    continue;
                }

                // Upload to S3
                await axios.put(uploadUrl, compressedFile, {
                    headers: {
                        "Content-Type": compressedFile.type,
                    },
                });

                // Save to database
                await addWorkshopImage({
                    workshopId: initialData.id,
                    image: url,
                });
            }
            toast.success("Images uploaded successfully");
            loadImages();
        } catch (error) {
            console.error("Upload error", error);
            toast.error("An error occurred during upload");
        } finally {
            setLoading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this image?")) return;
        try {
            await deleteWorkshopImage(id);
            toast.success("Image deleted");
            loadImages();
        } catch (error) {
            toast.error("Failed to delete image");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button disabled={isCompleted} variant="outline" size="icon">
                        <ImageIcon className="w-4 h-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Workshop Images - {initialData?.name}</DialogTitle>
                    <DialogDescription>
                        Upload and manage workshop images.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            disabled={loading}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary file:text-primary-foreground
                                hover:file:bg-primary/90"
                            id="workshop-image-upload"
                        />
                        {loading && (
                            <p className="text-sm text-muted-foreground mt-2 flex items-center">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading and compressing images...
                            </p>
                        )}
                    </div>

                    {fetching ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {images.map((img) => (
                                <div key={img.id} className="relative group rounded-md border overflow-hidden">
                                    <img src={img.image} alt="Workshop" className="w-full h-40 object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => handleDelete(img.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {images.length === 0 && !loading && (
                                <div className="col-span-full text-center py-8 text-gray-500 border rounded-md bg-gray-50">
                                    No images uploaded yet.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
