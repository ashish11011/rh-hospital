"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllRegistrations } from "@/actions/registrationActions";
import * as XLSX from "xlsx";
import { Download, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Registration = {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  designation: string;
  instituteName: string;
  city: string | null;
  modeOfAttandnace: "online" | "offline" | null;
  workshopName: string | null;
  paymentStatus: string | null;
};

type Workshop = {
  id: string;
  name: string;
};

interface RegistrationClientProps {
  data: Registration[];
  total: number;
  workshops: Workshop[];
  limit: number;
}

export function RegistrationClient({
  data,
  total,
  workshops,
  limit,
}: RegistrationClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [emailFilter, setEmailFilter] = useState(
    searchParams.get("email") || "",
  );
  const [workshopId, setWorkshopId] = useState(
    searchParams.get("workshopId") || "",
  );
  const [isExporting, setIsExporting] = useState(false);

  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(total / limit);

  const applyFilters = (newEmail: string, newWorkshopId: string) => {
    const params = new URLSearchParams();
    if (newEmail) params.set("email", newEmail);
    if (newWorkshopId) params.set("workshopId", newWorkshopId);
    params.set("page", "1"); // Reset to page 1 on filter
    router.push(`/admin/workshop-registration?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/workshop-registration?${params.toString()}`);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const allData = await getAllRegistrations(workshopId);

      const worksheetData = allData.map((reg) => ({
        ID: reg.id,
        "Workshop Name": reg.workshopName || "N/A",
        Name: reg.name,
        Email: reg.email,
        Mobile: reg.mobileNumber,
        Designation: reg.designation,
        "Institute/Company": reg.instituteName,
        City: reg.city || "N/A",
        "Mode of Attendance": reg.modeOfAttandnace,
        "Payment Status": reg.paymentStatus || "N/A",
      }));

      const ws = XLSX.utils.json_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Registrations");
      XLSX.writeFile(wb, "WorkshopRegistrations.xlsx");
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  // Wait a bit before applying the email search so it doesn't trigger repeatedly on fast typing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (emailFilter !== (searchParams.get("email") || "")) {
        applyFilters(emailFilter, workshopId);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [emailFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row">
          <div className="relative w-full max-w-sm">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              placeholder="Search by email..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="w-full max-w-xs">
            <select
              title="Filter by workshop"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              value={workshopId}
              onChange={(e) => {
                setWorkshopId(e.target.value);
                applyFilters(emailFilter, e.target.value);
              }}
            >
              <option value="">All Workshops</option>
              {workshops.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="whitespace-nowrap"
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exporting..." : "Export Excel"}
        </Button>
      </div>

      <div className="bg-card rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Workshop</TableHead>
              <TableHead>Institute</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-8 text-center"
                >
                  No registrations found
                </TableCell>
              </TableRow>
            ) : (
              data.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell className="font-medium">{reg.name}</TableCell>
                  <TableCell>{reg.email}</TableCell>
                  <TableCell>{reg.mobileNumber}</TableCell>
                  <TableCell>{reg.workshopName}</TableCell>
                  <TableCell>{reg.instituteName}</TableCell>
                  <TableCell className="capitalize">
                    {reg.modeOfAttandnace}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        reg.paymentStatus === "completed"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {reg.paymentStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {(totalPages > 1 || total > 0) && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Showing {Math.min((currentPage - 1) * limit + 1, total)} to{" "}
            {Math.min(currentPage * limit, total)} of {total} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
