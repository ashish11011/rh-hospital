import { workshopRegistration, workshop } from "@/db"
import { db } from "@/lib/dbConfig"
import Link from "next/link"
import { eq, desc, count, and } from "drizzle-orm"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { RegistrationDetails } from "./RegistrationDetails"
import { Button } from "@/components/ui/button"

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const isFilterPaymentComplete = params.filter?.toString() || "";
    console.log(isFilterPaymentComplete, "isFilterPaymentComplete");

    const filter = [];
    filter.push(eq(workshopRegistration.workshopId, "b4f95ab7-9ae7-46f8-8dac-bb6d299b3ec0"));
    if (isFilterPaymentComplete) {
        filter.push(eq(workshopRegistration.paymentStatus, "completed"));
    }

    const registrations = await db.select({
        registration: workshopRegistration,
        workshopName: workshop.name
    })
        .from(workshopRegistration)
        .where(and(...filter))
        .leftJoin(workshop, eq(workshopRegistration.workshopId, workshop.id))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(workshopRegistration.createdAt));

    const totalCountResult = await db.select({ value: count() }).from(workshopRegistration)
        .where(and(...filter))

    const totalCount = totalCountResult[0].value;
    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="  space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-4  shadow-sm border">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Workshop Registrations</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and view all workshop registrations.</p>
                </div>
                <div className="px-4  text-sm font-medium text-gray-700">
                    Total: {totalCount}
                </div>
            </div>
            <div className=" mb-4 ml-auto w-fit">
                <Link className=" mr-auto" href={isFilterPaymentComplete ? "/admin" : "/admin?filter=1"}>
                    <Button>{isFilterPaymentComplete ? "Get all registrations" : "Get completed registrations"}</Button>
                </Link>
            </div>
            <div className="  border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="font-semibold text-gray-600">Name</TableHead>
                            <TableHead className="font-semibold text-gray-600">Email</TableHead>
                            <TableHead className="font-semibold text-gray-600">Workshop</TableHead>
                            <TableHead className="font-semibold text-gray-600">Payment</TableHead>
                            <TableHead className="font-semibold text-gray-600">Mode</TableHead>
                            <TableHead className="text-right font-semibold text-gray-600">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {registrations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No registrations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            registrations.map(({ registration, workshopName }) => (
                                <TableRow key={registration.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="font-medium text-gray-900">{registration.name}</TableCell>
                                    <TableCell className="text-gray-600">{registration.email}</TableCell>
                                    <TableCell className="text-gray-600">{workshopName || "N/A"}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${registration.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                            registration.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {registration.paymentStatus}
                                        </span>
                                    </TableCell>
                                    <TableCell className="capitalize text-gray-600">{registration.modeOfAttandnace}</TableCell>
                                    <TableCell className="text-right">
                                        <RegistrationDetails registration={registration} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 font-medium">
                        Showing page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            asChild={page > 1}
                            className="bg-white shadow-sm"
                        >
                            {page > 1 ? (
                                <Link href={`/admin?page=${page - 1}`}>Previous</Link>
                            ) : (
                                "Previous"
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages}
                            asChild={page < totalPages}
                            className="bg-white shadow-sm"
                        >
                            {page < totalPages ? (
                                <Link href={`/admin?page=${page + 1}`}>Next</Link>
                            ) : (
                                "Next"
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}