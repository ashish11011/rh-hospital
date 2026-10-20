import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyWorkshopMemberOtp, WorkshopMemberError } from "@/lib/workshopMember";
import { memberCookieName, MEMBER_SESSION_MS } from "@/lib/workshopMemberOtp";

const input = z.object({ challengeId: z.string().uuid(), workshopId: z.string().uuid(), otp: z.string().regex(/^\d{6}$/) });

export async function POST(req: NextRequest) {
  try {
    const parsed = input.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ message: "Enter the six-digit OTP sent to your registered email." }, { status: 400 });
    const { challengeId, workshopId, otp } = parsed.data;
    const result = await verifyWorkshopMemberOtp(challengeId, workshopId, otp);
    const response = NextResponse.json({ data: { details: result.details, expiresIn: MEMBER_SESSION_MS / 1000 } }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(memberCookieName(workshopId), result.cookie, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict",
      path: "/api/workshop", maxAge: MEMBER_SESSION_MS / 1000,
    });
    return response;
  } catch (error) {
    if (error instanceof WorkshopMemberError) return NextResponse.json({ message: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return NextResponse.json({ message: "Invalid request." }, { status: 400 });
    console.error("Workshop member OTP verification failed", error);
    return NextResponse.json({ message: "Unable to verify OTP. Please try again later." }, { status: 500 });
  }
}
