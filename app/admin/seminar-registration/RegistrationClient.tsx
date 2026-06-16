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
import { getAllSeminarRegistrations } from "@/actions/seminarAdminActions";
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
  registrationMode: string | null;
  seminarName: string | null;
  paymentStatus: string | null;
  amount: string;
};

type Seminar = {
  id: string;
  name: string;
};

interface RegistrationClientProps {
  data: Registration[];
  total: number;
  seminars: Seminar[];
  limit: number;
}

export function RegistrationClient({ data, total, seminars, limit }: RegistrationClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [emailFilter, setEmailFilter] = useState(searchParams.get("email") || "");
  const [seminarId, setSeminarId] = useState(searchParams.get("seminarId") || "");
  const [isExporting, setIsExporting] = useState(false);

  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(total / limit);

  const applyFilters = (newEmail: string, newSeminarId: string) => {
    const params = new URLSearchParams();
    if (newEmail) params.set("email", newEmail);
    if (newSeminarId) params.set("seminarId", newSeminarId);
    params.set("page", "1"); // Reset to page 1 on filter
    router.push(`/admin/seminar-registration?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/seminar-registration?${params.toString()}`);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const allData = await getAllSeminarRegistrations(seminarId);

      const worksheetData = allData.map(reg => ({
        ID: reg.id,
        "Seminar Name": reg.seminarName || "N/A",
        Name: reg.name,
        Email: reg.email,
        Mobile: reg.mobileNumber,
        Gender: reg.gender,
        Designation: reg.designation,
        Qualification: reg.qualification,
        "Institute/Company": reg.instituteName,
        "Address Line 1": reg.addressLine1,
        "Address Line 2": reg.addressLine2 || "N/A",
        City: reg.city || "N/A",
        State: reg.state,
        Country: reg.country,
        Pincode: reg.pincode,
        "Paper Presentation": reg.paperPresentation ? "Yes" : "No",
        "Paper Title": reg.paperTitle || "N/A",
        "Author Name": reg.authorName || "N/A",
        "Paper Institution": reg.paperInstitution || "N/A",
        "Additional Details": reg.additionalDetails || "N/A",
        "Reference Type": reg.referenceType,
        "Reference Person Name": reg.referencePersonName || "N/A",
        "Reference Person Mobile": reg.referencePersonMobile || "N/A",
        "Social Media Name": reg.socialMediaName || "N/A",
        "Mode of Attendance": reg.registrationMode,
        "Offline Duration": reg.offlineDuration || "N/A",
        "NAIT Member": reg.isNaitMember ? "Yes" : "No",
        "NAIT Registration ID": reg.naitRegistrationId || "N/A",
        "Amount": reg.amount,
        "Payment Status": reg.paymentStatus || "N/A",
        "Payment ID": reg.paymentId || "N/A",
        "Order ID": reg.orderId || "N/A",
        "Created At": reg.createdAt ? new Date(reg.createdAt).toLocaleString() : "N/A",
      }));

      const ws = XLSX.utils.json_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Registrations");
      XLSX.writeFile(wb, "SeminarRegistrations.xlsx");
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
        applyFilters(emailFilter, seminarId);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [emailFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-w-xs w-full">
            <select
              title="Filter by seminar"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={seminarId}
              onChange={(e) => {
                setSeminarId(e.target.value);
                applyFilters(emailFilter, e.target.value);
              }}
            >
              <option value="">All Seminars</option>
              {seminars.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button onClick={handleExport} disabled={isExporting} className="whitespace-nowrap">
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exporting..." : "Export Excel"}
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Seminar</TableHead>
              <TableHead>Institute</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No registrations found
                </TableCell>
              </TableRow>
            ) : (
              data.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell className="font-medium">{reg.name}</TableCell>
                  <TableCell>{reg.email}</TableCell>
                  <TableCell>{reg.mobileNumber}</TableCell>
                  <TableCell>{reg.seminarName}</TableCell>
                  <TableCell>{reg.instituteName}</TableCell>
                  <TableCell className="capitalize">{reg.registrationMode}</TableCell>
                  <TableCell>₹{reg.amount}</TableCell>
                  <TableCell>
                    <Badge variant={reg.paymentStatus === "completed" || reg.paymentStatus === "paid" ? "default" : "secondary"}>{reg.paymentStatus}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {(totalPages > 1 || total > 0) && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * limit + 1, total)} to {Math.min(currentPage * limit, total)} of {total} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
