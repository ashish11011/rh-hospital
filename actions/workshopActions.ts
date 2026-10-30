"use server";
import { invalidateRedisCache } from "@/lib/redisCache";
import { runLoggedOperation } from "@/lib/logging/operations";
import { createLogger } from "@/lib/logging/logger";

import { db } from "@/lib/dbConfig";
import { workshop, workshopImage } from "@/db/index";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import {
  validateWorkshopAttendance,
  type WorkshopAttendanceMode,
} from "@/lib/workshopAttendance";

const logger = createLogger("service", "actions/workshopActions.ts");

type WorkshopInput = {
  name: string;
  bannerImage?: string | null;
  description: string;
  content: string;
  startTime: Date;
  endTime: Date;
  onlinePrice: number;
  offlinePrice: number;
  attendanceMode: WorkshopAttendanceMode;
  isCompleted: boolean;
};

export async function getWorkshops() {
  return runLoggedOperation(
    "service",
    "actions/workshopActions.ts:getWorkshops",
    async () => {
      try {
        return await db
          .select()
          .from(workshop)
          .orderBy(desc(workshop.startTime));
      } catch (error) {
        logger.error("Fetch Workshops error:", { details: [error] });
        return [];
      }
    },
    true,
  );
}

export async function getWorkshopById(id: string) {
  return runLoggedOperation(
    "service",
    "actions/workshopActions.ts:getWorkshopById",
    async () => {
      try {
        const [record] = await db
          .select()
          .from(workshop)
          .where(eq(workshop.id, id));
        return record;
      } catch (error) {
        logger.error("Fetch Workshop error:", { details: [error] });
        return null;
      }
    },
    true,
  );
}

export async function createWorkshop(data: WorkshopInput) {
  return runLoggedOperation(
    "service",
    "actions/workshopActions.ts:createWorkshop",
    async () => {
      try {
        await requireAdmin("workshop");
        validateWorkshopAttendance(data);
        await db.insert(workshop).values(data);
        await invalidateRedisCache("workshops");
        revalidatePath("/");
        revalidatePath("/workshops/[id]", "page");
        revalidatePath("/admin/workshop");
        revalidatePath("/workshops");
        return { success: true };
      } catch (error) {
        logger.error("Create Workshop error:", { details: [error] });
        return { error: "Failed to create workshop" };
      }
    },
    true,
  );
}

export async function updateWorkshop(id: string, data: Partial<WorkshopInput>) {
  return runLoggedOperation(
    "service",
    "actions/workshopActions.ts:updateWorkshop",
    async () => {
      try {
        await requireAdmin("workshop");
        // filter out undefined from data
        const updateData = Object.fromEntries(
          Object.entries(data).filter(([_, v]) => v !== undefined),
        );

        const existing = await getWorkshopById(id);
        if (!existing) throw new Error("Workshop not found");
        validateWorkshopAttendance({ ...existing, ...updateData });

        await db.update(workshop).set(updateData).where(eq(workshop.id, id));
        await invalidateRedisCache("workshops");
        revalidatePath("/");
        revalidatePath("/workshops/[id]", "page");
        revalidatePath("/admin/workshop");
        revalidatePath("/workshops");
        revalidatePath(`/workshops/${id}`);
        return { success: true };
      } catch (error) {
        logger.error("Update Workshop error:", { details: [error] });
        return { error: "Failed to update workshop" };
      }
    },
    true,
  );
}

export async function deleteWorkshop(id: string) {
  return runLoggedOperation(
    "service",
    "actions/workshopActions.ts:deleteWorkshop",
    async () => {
      try {
        await requireAdmin("workshop");
        await db.delete(workshop).where(eq(workshop.id, id));
        await invalidateRedisCache("workshops");
        revalidatePath("/");
        revalidatePath("/workshops/[id]", "page");
        revalidatePath("/admin/workshop");
        revalidatePath("/workshops");
        return { success: true };
      } catch (error) {
        logger.error("Delete Workshop error:", { details: [error] });
        return { error: "Failed to delete workshop" };
      }
    },
    true,
  );
}

export async function getWorkshopImages(workshopId: string) {
  return runLoggedOperation(
    "service",
    "actions/workshopActions.ts:getWorkshopImages",
    async () => {
      try {
        await requireAdmin("workshop");
        return await db
          .select()
          .from(workshopImage)
          .where(eq(workshopImage.workshopId, workshopId))
          .orderBy(workshopImage.displayOrder);
      } catch (error) {
        logger.error("Fetch Workshop Images error:", { details: [error] });
        return [];
      }
    },
    true,
  );
}

export async function addWorkshopImage(data: {
  workshopId: string;
  image: string;
}) {
  return runLoggedOperation(
    "service",
    "actions/workshopActions.ts:addWorkshopImage",
    async () => {
      try {
        await requireAdmin("workshop");
        await db.insert(workshopImage).values(data);
        await invalidateRedisCache("workshops");
        revalidatePath("/");
        revalidatePath("/workshops/[id]", "page");
        revalidatePath("/admin/workshop");
        revalidatePath("/workshops");
        return { success: true };
      } catch (error) {
        logger.error("Add Workshop Image error:", { details: [error] });
        return { error: "Failed to add workshop image" };
      }
    },
    true,
  );
}

export async function deleteWorkshopImage(id: string) {
  return runLoggedOperation(
    "service",
    "actions/workshopActions.ts:deleteWorkshopImage",
    async () => {
      try {
        await requireAdmin("workshop");
        await db.delete(workshopImage).where(eq(workshopImage.id, id));
        await invalidateRedisCache("workshops");
        revalidatePath("/");
        revalidatePath("/workshops/[id]", "page");
        revalidatePath("/admin/workshop");
        revalidatePath("/workshops");
        return { success: true };
      } catch (error) {
        logger.error("Delete Workshop Image error:", { details: [error] });
        return { error: "Failed to delete workshop image" };
      }
    },
    true,
  );
}
