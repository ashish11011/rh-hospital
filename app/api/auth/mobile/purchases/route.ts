import { NextResponse } from "next/server";
import { getAuthenticatedApiEmail } from "@/lib/mobileApiAuth";
import { getUserPurchasesByEmail } from "@/lib/userDashboardData";

export async function GET(req: Request) {
  try {
    const email = await getAuthenticatedApiEmail(req);

    if (!email) {
      return NextResponse.json({ error: "Unauthorized: Invalid token or session" }, { status: 401 });
    }

    const purchaseHistory = await getUserPurchasesByEmail(email);

    return NextResponse.json({ success: true, purchases: purchaseHistory }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch purchase history" }, { status: 500 });
  }
}
