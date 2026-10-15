import { desc, sql } from "drizzle-orm";
import { contact } from "@/db";
import { getCurrentAdminAccess } from "@/lib/adminAuth";
import { hasAdminPermission } from "@/lib/adminAccess";
import { contactEnquiriesCsv } from "@/lib/contactEnquiriesCsv";
import { db } from "@/lib/dbConfig";

export const dynamic = "force-dynamic";

export async function GET() {
  const { access } = await getCurrentAdminAccess();
  if (!hasAdminPermission(access, "contacts")) {
    return Response.json(
      { error: access ? "Forbidden" : "Unauthorized" },
      { status: access ? 403 : 401 },
    );
  }

  const enquiries = await db
    .select()
    .from(contact)
    .orderBy(sql`${contact.createdAt} desc nulls last`, desc(contact.id));

  return new Response(contactEnquiriesCsv(enquiries), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contact-enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
