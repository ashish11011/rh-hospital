"use server";
import { invalidateRedisCache } from "@/lib/redisCache";
import { runLoggedOperation } from "@/lib/logging/operations";
import { createLogger } from "@/lib/logging/logger";

import { auth } from "@/auth";
import { db } from "@/lib/dbConfig";
import { user } from "@/db";
import { sendAccountDeletionRequestEmails } from "@/lib/sesClient";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const logger = createLogger("service", "lib/actions/profile.ts");

export async function getUserProfile(email: string) {
  return runLoggedOperation(
    "service",
    "lib/actions/profile.ts:getUserProfile",
    async () => {
      try {
        const userData = await db
          .select()
          .from(user)
          .where(eq(user.email, email))
          .limit(1);
        return userData[0] || null;
      } catch (error) {
        logger.error("Error fetching user profile:", { details: [error] });
        return null;
      }
    },
    true,
  );
}

export async function updateUserProfile(email: string, data: any) {
  return runLoggedOperation(
    "service",
    "lib/actions/profile.ts:updateUserProfile",
    async () => {
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
          await db
            .update(user)
            .set({
              name: data.name,
              mobileNumber: data.mobileNumber || "",
              designation: data.designation || "",
              instituteName: data.instituteName || "",
              city: data.city || "",
              updatedAt: new Date(),
            })
            .where(eq(user.email, sessionEmail));
        }

        await invalidateRedisCache("reviews");
        revalidatePath("/dashboard/profile");
        return { success: true };
      } catch (error: any) {
        logger.error("Error updating user profile:", { details: [error] });
        return { error: error.message || "Failed to update profile" };
      }
    },
    true,
  );
}

export async function requestAccountDeletionOrDeactivation() {
  return runLoggedOperation(
    "service",
    "lib/actions/profile.ts:requestAccountDeletionOrDeactivation",
    async () => {
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
        logger.error("Error requesting account deletion/deactivation:", {
          details: [error],
        });
        return {
          error:
            error.message ||
            "Failed to raise account deletion or deactivation request",
        };
      }
    },
    true,
  );
}
