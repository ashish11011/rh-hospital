import { getUsers } from "@/actions/userAdminActions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { UserClient } from "./UserClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin - Users",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  const page = Number(resolvedParams.page) || 1;
  const search =
    typeof resolvedParams.search === "string" ? resolvedParams.search : "";
  const limit = 15;

  const { data, total } = await getUsers({ page, limit, search });

  return (
    <div className="w-full py-6">
      <div className="flex gap-2">
        <Link href="/admin">
          <div className="cursor-pointer p-2 hover:bg-gray-200">
            <ArrowLeft />
          </div>
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-2">
            View basic user information.
          </p>
        </div>
      </div>

      <UserClient data={data as any} total={total} limit={limit} />
    </div>
  );
}
