"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type User = {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  designation: string;
  instituteName: string;
  city: string | null;
  isActive: boolean | null;
  role: string;
  createdAt: Date | null;
};

interface UserClientProps {
  data: User[];
  total: number;
  limit: number;
}

export function UserClient({ data, total, limit }: UserClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchFilter, setSearchFilter] = useState(
    searchParams.get("search") || "",
  );

  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(total / limit);

  const applyFilters = (newSearch: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    params.set("page", "1");
    router.push(`/admin/users?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/users?${params.toString()}`);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchFilter !== (searchParams.get("search") || "")) {
        applyFilters(searchFilter);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search by name, email, or mobile..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="bg-card rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Institute</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-8 text-center"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.mobileNumber}</TableCell>
                  <TableCell>{user.designation}</TableCell>
                  <TableCell>{user.instituteName}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Showing {(currentPage - 1) * limit + 1} to{" "}
            {Math.min(currentPage * limit, total)} of {total} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <span className="mx-2 text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
