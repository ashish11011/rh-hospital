"use server";

import { db } from "@/lib/dbConfig";
import { user } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getUserProfile(email: string) {
  try {
    const userData = await db.select().from(user).where(eq(user.email, email)).limit(1);
    return userData[0] || null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function updateUserProfile(email: string, data: any) {
  try {
    const existingUser = await getUserProfile(email);
    if (!existingUser) {
      await db.insert(user).values({
        email: email,
        name: data.name,
        mobileNumber: data.mobileNumber || "",
        designation: data.designation || "",
        instituteName: data.instituteName || "",
        city: data.city || "",
        password: "", // Managed by Cognito
      });
    } else {
      await db.update(user).set({
        name: data.name,
        mobileNumber: data.mobileNumber || "",
        designation: data.designation || "",
        instituteName: data.instituteName || "",
        city: data.city || "",
        updatedAt: new Date(),
      }).where(eq(user.email, email));
    }

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return { error: error.message || "Failed to update profile" };
  }
}
