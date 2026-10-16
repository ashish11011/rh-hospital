import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/dbConfig";
import { user } from "@/db";
import { extractEmailFromToken } from "@/lib/verify-token";

async function authenticatedEmail(req: Request) {
  const token = req.headers.get("authorization")?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) return null;
  return (await extractEmailFromToken(token))?.toLowerCase() || null;
}

function deviceIdFrom(body: Record<string, unknown>) {
  return typeof body.deviceId === "string" && body.deviceId.length <= 200
    ? body.deviceId.trim()
    : "";
}

export async function PUT(req: Request) {
  try {
    const email = await authenticatedEmail(req);
    if (!email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid registration" },
        { status: 400 },
      );
    }
    const deviceId = deviceIdFrom(body);
    const fcmToken =
      typeof body.fcmToken === "string" ? body.fcmToken.trim() : "";
    if (
      !deviceId ||
      !fcmToken ||
      fcmToken.length > 4096 ||
      /\s/.test(fcmToken)
    ) {
      return NextResponse.json(
        { error: "Invalid notification token or device" },
        { status: 400 },
      );
    }

    const registered = await db.transaction(async (tx) => {
      // Keep the existing one-device-per-user model. An older device cannot
      // replace the token after a newer device has logged into the account.
      const [account] = await tx
        .select({ id: user.id })
        .from(user)
        .where(and(eq(user.email, email), eq(user.deviceId, deviceId)))
        .for("update");
      if (!account) return false;

      // A token belongs to one installation. Switching accounts on that
      // installation must stop delivery for the previous account.
      await tx
        .update(user)
        .set({ fcmToken: null })
        .where(and(eq(user.fcmToken, fcmToken), ne(user.id, account.id)));
      await tx
        .update(user)
        .set({ fcmToken, lastActive: new Date() })
        .where(eq(user.id, account.id));
      return true;
    });
    if (!registered) {
      return NextResponse.json(
        { error: "Sign in again on this device to enable notifications" },
        { status: 409 },
      );
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to register notifications" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const email = await authenticatedEmail(req);
    if (!email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => null);
    const deviceId = body && typeof body === "object" ? deviceIdFrom(body) : "";
    if (!deviceId)
      return NextResponse.json({ error: "Invalid device" }, { status: 400 });
    await db
      .update(user)
      .set({ fcmToken: null })
      .where(and(eq(user.email, email), eq(user.deviceId, deviceId)));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to unregister notifications" },
      { status: 500 },
    );
  }
}
