import { NextResponse } from "next/server";
import { db } from "@/lib/dbConfig";
import { user } from "@/db";
import { eq } from "drizzle-orm";

import { extractEmailFromToken } from "@/lib/verify-token";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const email = await extractEmailFromToken(token);

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const userData = await db.select({
      name: user.name,
      email: user.email,
      number: user.mobileNumber,
      designation: user.designation,
      instituteName: user.instituteName,
      city: user.city,
    }).from(user).where(eq(user.email, email.toLowerCase())).limit(1);

    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: userData[0] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch user information" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const email = await extractEmailFromToken(token);

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    
    // Extract allowed fields explicitly, ignoring email
    const { name, number, designation, instituteName, city } = body;
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (number !== undefined) updateData.mobileNumber = number; // map number to mobileNumber
    if (designation !== undefined) updateData.designation = designation;
    if (instituteName !== undefined) updateData.instituteName = instituteName;
    if (city !== undefined) updateData.city = city;

    if (Object.keys(updateData).length === 0) {
       return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
    }

    await db.update(user)
      .set(updateData)
      .where(eq(user.email, email.toLowerCase()));

    return NextResponse.json({ success: true, message: "User updated successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user information" }, { status: 500 });
  }
}
