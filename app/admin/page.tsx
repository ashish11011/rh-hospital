import { db } from "@/lib/dbConfig"
import { workshop } from "@/db"
import Link from "next/link"
import { desc } from "drizzle-orm"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export default async function Page() {
    const workshops = await db.select().from(workshop).orderBy(desc(workshop.startTime));

    const formatDate = (dateValue: Date | null) => {
        if (!dateValue) return "N/A";
        return new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(dateValue);
    };

    return (
        <div className="space-y-6 w-full">
            <div className="flex justify-between items-center bg-gray-50 p-4 shadow-sm border">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Workshops</h1>
                    <p className="text-sm text-gray-500 mt-1">Select a workshop to view its registrations.</p>
                </div>
            </div>

            <div className="border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="font-semibold text-gray-600">Image</TableHead>
                            <TableHead className="font-semibold text-gray-600">Name</TableHead>
                            <TableHead className="font-semibold text-gray-600">Start Time</TableHead>
                            <TableHead className="font-semibold text-gray-600">End Time</TableHead>
                            <TableHead className="text-right font-semibold text-gray-600">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {workshops.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No workshops found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            workshops.map((ws) => (
                                <TableRow key={ws.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell>
                                        {ws.bannerImage ? (
                                            <img src={ws.bannerImage} alt={ws.name} className="w-16 h-10 object-cover rounded" />
                                        ) : (
                                            <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No Img</div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-900">{ws.name}</TableCell>
                                    <TableCell className="text-gray-600">{formatDate(ws.startTime)}</TableCell>
                                    <TableCell className="text-gray-600">{formatDate(ws.endTime)}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/workshop-registration?workshopId=${ws.id}`}>
                                            <Button variant="outline" size="sm">
                                                View Registrations
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
