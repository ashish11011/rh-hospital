import React from 'react'
import { getWorkshops } from '@/actions/workshopActions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const page = async () => {
    const workshops = await getWorkshops()

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Generate Certificates</h1>
                <p className="text-muted-foreground">Select a workshop to generate and manage certificates.</p>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Workshop Name</TableHead>
                            <TableHead>Start Time</TableHead>
                            <TableHead>End Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {workshops.map((workshop) => (
                            <TableRow key={workshop.id}>
                                <TableCell className="font-medium">{workshop.name}</TableCell>
                                <TableCell>{new Date(workshop.startTime).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(workshop.endTime).toLocaleDateString()}</TableCell>
                                <TableCell>{workshop.isCompleted ? "Completed" : "Active"}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/generate-certificate/${workshop.id}`}>
                                            Select
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {workshops.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">
                                    No workshops found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default page