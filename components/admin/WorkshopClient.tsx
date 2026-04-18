"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { deleteWorkshop } from "@/actions/workshopActions";
import { Trash2, Pencil } from "lucide-react";
import { WorkshopFormDialog } from "./WorkshopFormDialog";

export function WorkshopClient({ workshops }: { workshops: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workshop? This action cannot be undone.")) return;

    try {
      setLoadingId(id);
      await deleteWorkshop(id);
    } catch (error) {
      console.error(error);
      alert("Failed to delete workshop");
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Workshops</h2>
        <WorkshopFormDialog />
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Online Price</TableHead>
              <TableHead>Offline Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workshops.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  No workshops found. Create one.
                </TableCell>
              </TableRow>
            ) : (
              workshops.map((ws) => (
                <TableRow key={ws.id}>
                  <TableCell>
                    {ws.bannerImage ? (
                      <img src={ws.bannerImage} alt={ws.name} className="w-16 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No Img</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{ws.name}</TableCell>
                  <TableCell>{formatDate(ws.startTime)}</TableCell>
                  <TableCell>{formatDate(ws.endTime)}</TableCell>
                  <TableCell>₹{ws.onlinePrice}</TableCell>
                  <TableCell>₹{ws.offlinePrice}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <WorkshopFormDialog
                        initialData={ws}
                        trigger={
                          <Button variant="outline" size="icon">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(ws.id)}
                        disabled={loadingId === ws.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
