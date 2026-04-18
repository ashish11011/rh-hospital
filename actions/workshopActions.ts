"use server";

import { db } from "@/lib/dbConfig";
import { workshop } from "@/db/index";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getWorkshops() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return await db.select().from(workshop).orderBy(desc(workshop.startTime));
  } catch (error) {
    console.error("Fetch Workshops error:", error);
    return [];
  }
}

export async function getWorkshopById(id: string) {
  try {
    const records = await db.select().from(workshop).where(eq(workshop.id, id));
    return records[0] || null;
  } catch (error) {
    console.error("Fetch Workshop error:", error);
    return null;
  }
}

export async function createWorkshop(data: {
  name: string;
  bannerImage?: string;
  description: string;
  content: string;
  startTime: Date;
  endTime: Date;
  onlinePrice: number;
  offlinePrice: number;
}) {
  try {
    await db.insert(workshop).values(data);
    revalidatePath("/admin/workshop");
    revalidatePath("/workshops");
    return { success: true };
  } catch (error) {
    console.error("Create Workshop error:", error);
    return { error: "Failed to create workshop" };
  }
}

export async function updateWorkshop(
  id: string,
  data: Partial<{
    name: string;
    bannerImage: string | null;
    description: string;
    content: string;
    startTime: Date;
    endTime: Date;
    onlinePrice: number;
    offlinePrice: number;
  }>
) {
  try {
    // filter out undefined from data
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    await db.update(workshop).set(updateData).where(eq(workshop.id, id));
    revalidatePath("/admin/workshop");
    revalidatePath("/workshops");
    revalidatePath(`/workshops/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Update Workshop error:", error);
    return { error: "Failed to update workshop" };
  }
}

export async function deleteWorkshop(id: string) {
  try {
    await db.delete(workshop).where(eq(workshop.id, id));
    revalidatePath("/admin/workshop");
    revalidatePath("/workshops");
    return { success: true };
  } catch (error) {
    console.error("Delete Workshop error:", error);
    return { error: "Failed to delete workshop" };
  }
}
