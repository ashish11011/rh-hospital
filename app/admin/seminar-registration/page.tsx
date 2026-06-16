import { getSeminarRegistrations, getSeminarsList } from "@/actions/seminarAdminActions";
import { RegistrationClient } from "./RegistrationClient";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Admin - Seminar Registrations",
};

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SeminarRegistrationsPage({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;

    const page = Number(resolvedParams.page) || 1;
    const emailFilter = typeof resolvedParams.email === "string" ? resolvedParams.email : "";
    const seminarId = typeof resolvedParams.seminarId === "string" ? resolvedParams.seminarId : "";
    const limit = 15;

    const [{ data, total }, seminars] = await Promise.all([
        getSeminarRegistrations({ page, limit, emailFilter, seminarId }),
        getSeminarsList()
    ]);

    return (
        <div className="py-6 w-full">
            <div className=" flex gap-2">
                <Link href="/admin">
                    <div className=" p-2 hover:bg-gray-200 cursor-pointer">
                        <ArrowLeft />
                    </div>
                </Link>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Seminar Registrations</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and view all seminar registrations with payment statuses.
                    </p>
                </div>
            </div>

            <RegistrationClient
                data={data as any}
                total={total}
                seminars={seminars}
                limit={limit}
            />
        </div>
    );
}
