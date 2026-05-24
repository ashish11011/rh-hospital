import { getRegistrations, getWorkshopsList } from "@/actions/registrationActions";
import { RegistrationClient } from "./RegistrationClient";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Admin - Workshop Registrations",
};

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function WorkshopRegistrationsPage({ searchParams }: PageProps) {
    // Await the searchParams as Next.js 15+ requires
    const resolvedParams = await searchParams;

    const page = Number(resolvedParams.page) || 1;
    const emailFilter = typeof resolvedParams.email === "string" ? resolvedParams.email : "";
    const workshopId = typeof resolvedParams.workshopId === "string" ? resolvedParams.workshopId : "";
    const limit = 15;

    const [{ data, total }, workshops] = await Promise.all([
        getRegistrations({ page, limit, emailFilter, workshopId }),
        getWorkshopsList()
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
                    <h1 className="text-3xl font-bold tracking-tight">Workshop Registrations</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and view all workshop registrations with payment statuses.
                    </p>
                </div>
            </div>

            <RegistrationClient
                data={data as any}
                total={total}
                workshops={workshops}
                limit={limit}
            />
        </div>
    );
}
