import { contact } from "@/db";
import { db } from "@/lib/dbConfig";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request", status: 400 },
      { status: 400 },
    );
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { message: "Invalid request", status: 400 },
      { status: 400 },
    );
  }
  const { name, email, mobileNumber, formSource } = body;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  // Course waitlists intentionally offer an optional comments field.
  const isWaitlist =
    typeof formSource === "string" &&
    formSource.startsWith("Course Waitlist - ");
  if (!message && !isWaitlist) {
    return NextResponse.json(
      { message: "Please enter your message.", status: 400 },
      { status: 400 },
    );
  }
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json(
      { message: "Please enter your name.", status: 400 },
      { status: 400 },
    );
  }
  try {
    await db.insert(contact).values({
      name: name.trim(),
      email: typeof email === "string" ? email.trim() : null,
      mobileNumber:
        typeof mobileNumber === "string" ? mobileNumber.trim() : null,
      message,
      formSource: typeof formSource === "string" ? formSource.trim() : null,
    });
    return NextResponse.json({
      message: "Message sent successfully",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to send message", status: 500 },
      { status: 500 },
    );
  }
}
