import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requestWorkshopMemberOtp, WorkshopMemberError } from "@/lib/workshopMember";

const input = z.object({
  registrationId: z.string().trim().regex(/^RH-[A-Z]{3}-\d{4}-\d{4,10}$/i, "Enter a valid RH registration ID."),
  workshopId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = input.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
    const data = await requestWorkshopMemberOtp(parsed.data.registrationId, parsed.data.workshopId);
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof WorkshopMemberError) return NextResponse.json({ message: error.message, retryAfter: error.retryAfter }, {
      status: error.status, headers: error.retryAfter ? { "Retry-After": String(error.retryAfter) } : {},
    });
    if (error instanceof SyntaxError) return NextResponse.json({ message: "Invalid request." }, { status: 400 });
    console.error("Workshop member OTP request failed", error);
    return NextResponse.json({ message: "Unable to send OTP. Please try again later." }, { status: 500 });
  }
}
