"use server";

import { auth } from "@/auth";
import { db } from "@/lib/dbConfig";
import { user } from "@/db";
import { sendAccountDeletionRequestEmails } from "@/lib/sesClient";
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
    const session = await auth();
    const sessionEmail = session?.user?.email?.toLowerCase();

    if (!sessionEmail) {
      return { error: "Unauthorized" };
    }

    if (email.toLowerCase() !== sessionEmail) {
      return { error: "Forbidden" };
    }

    const existingUser = await getUserProfile(sessionEmail);
    if (!existingUser) {
      await db.insert(user).values({
        email: sessionEmail,
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
      }).where(eq(user.email, sessionEmail));
    }

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return { error: error.message || "Failed to update profile" };
  }
}

export async function requestAccountDeletionOrDeactivation() {
  try {
    const session = await auth();
    const sessionEmail = session?.user?.email?.toLowerCase();

    if (!sessionEmail) {
      return { error: "Unauthorized" };
    }

    const existingUser = await getUserProfile(sessionEmail);

    await sendAccountDeletionRequestEmails({
      id: existingUser?.id,
      name: existingUser?.name || session?.user?.name || "User",
      email: sessionEmail,
      mobileNumber: existingUser?.mobileNumber,
      designation: existingUser?.designation,
      instituteName: existingUser?.instituteName,
      city: existingUser?.city,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error requesting account deletion/deactivation:", error);
    return {
      error:
        error.message ||
        "Failed to raise account deletion or deactivation request",
    };
  }
}
