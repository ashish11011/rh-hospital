"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { deleteWorkshop } from "@/actions/workshopActions";
import { Trash2, Pencil, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { WorkshopFormDialog } from "./WorkshopFormDialog";
import { WorkshopImages } from "./WorkshopImages";
import { getS3AssetUrl } from "@/lib/s3Asset";
import { formatWorkshopDateTime } from "@/helper/workshopDateTime";
import {
  WORKSHOP_ATTENDANCE_LABELS,
  getWorkshopAttendanceModes,
  type WorkshopAttendanceMode,
} from "@/lib/workshopAttendance";

export function WorkshopClient({ workshops }: { workshops: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this workshop? This action cannot be undone.",
      )
    )
      return;

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Workshops</h2>
        <WorkshopFormDialog />
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Attendance Mode</TableHead>
              <TableHead>Online Price</TableHead>
              <TableHead>Offline Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workshops.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-6 text-center text-gray-500"
                >
                  No workshops found. Create one.
                </TableCell>
              </TableRow>
            ) : (
              workshops.map((ws) => (
                <TableRow key={ws.id}>
                  <TableCell>
                    {ws.bannerImage ? (
                      <Image
                        width={300}
                        height={300}
                        src={getS3AssetUrl(ws.bannerImage)}
                        alt={ws.name}
                        className="h-10 w-16 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-16 items-center justify-center rounded bg-gray-200 text-xs text-gray-500">
                        No Img
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{ws.name}</TableCell>
                  <TableCell>{formatWorkshopDateTime(ws.startTime)}</TableCell>
                  <TableCell>{formatWorkshopDateTime(ws.endTime)}</TableCell>
                  <TableCell>
                    {
                      WORKSHOP_ATTENDANCE_LABELS[
                        (ws.attendanceMode ?? "both") as WorkshopAttendanceMode
                      ]
                    }
                  </TableCell>
                  <TableCell>
                    {getWorkshopAttendanceModes(ws.attendanceMode).includes(
                      "online",
                    )
                      ? `₹${ws.onlinePrice}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {getWorkshopAttendanceModes(ws.attendanceMode).includes(
                      "offline",
                    )
                      ? `₹${ws.offlinePrice}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <WorkshopImages
                        initialData={ws}
                        isCompleted={ws.isCompleted}
                        trigger={
                          <Button
                            disabled={!ws.isCompleted}
                            variant="outline"
                            size="icon"
                          >
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <WorkshopFormDialog
                        initialData={ws}
                        trigger={
                          <Button variant="outline" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(ws.id)}
                        disabled={loadingId === ws.id}
                      >
                        <Trash2 className="h-4 w-4" />
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
