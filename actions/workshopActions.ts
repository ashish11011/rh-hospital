"use server";

import { db } from "@/lib/dbConfig";
import { workshop, workshopImage } from "@/db/index";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getWorkshops() {
  try {
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
  isCompleted: boolean;
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
    isCompleted: boolean;
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

export async function getWorkshopImages(workshopId: string) {
  try {
    return await db.select().from(workshopImage).where(eq(workshopImage.workshopId, workshopId)).orderBy(workshopImage.displayOrder);
  } catch (error) {
    console.error("Fetch Workshop Images error:", error);
    return [];
  }
}

export async function addWorkshopImage(data: { workshopId: string; image: string }) {
  try {
    await db.insert(workshopImage).values(data);
    revalidatePath("/admin/workshop");
    revalidatePath("/workshops");
    return { success: true };
  } catch (error) {
    console.error("Add Workshop Image error:", error);
    return { error: "Failed to add workshop image" };
  }
}

export async function deleteWorkshopImage(id: string) {
  try {
    await db.delete(workshopImage).where(eq(workshopImage.id, id));
    revalidatePath("/admin/workshop");
    revalidatePath("/workshops");
    return { success: true };
  } catch (error) {
    console.error("Delete Workshop Image error:", error);
    return { error: "Failed to delete workshop image" };
  }
}
