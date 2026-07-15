"use server";

import { db } from "@/lib/dbConfig";
import { workshopRegistration, workshop } from "@/db/index";
import { eq, ilike, and, desc, count } from "drizzle-orm";
import { requireAdmin } from "@/lib/adminAuth";

export async function getRegistrations({
  page = 1,
  limit = 20,
  emailFilter = "",
  workshopId = ""
}) {
  try {
    await requireAdmin("full");
    const conditions = [];
    if (emailFilter) conditions.push(ilike(workshopRegistration.email, `%${emailFilter}%`));
    if (workshopId) conditions.push(eq(workshopRegistration.workshopId, workshopId));

    const offset = (page - 1) * limit;

    const baseQuery = db.select({
      id: workshopRegistration.id,
      name: workshopRegistration.name,
      email: workshopRegistration.email,
      mobileNumber: workshopRegistration.mobileNumber,
      designation: workshopRegistration.designation,
      instituteName: workshopRegistration.instituteName,
      city: workshopRegistration.city,
      modeOfAttandnace: workshopRegistration.modeOfAttandnace,
      workshopName: workshop.name,
      paymentStatus: workshopRegistration.paymentStatus,
    })
      .from(workshopRegistration)
      .leftJoin(workshop, eq(workshopRegistration.workshopId, workshop.id))
    // .leftJoin(workshopPayment, eq(workshopRegistration.id, workshopPayment.registrationId));

    const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    const data = await query.limit(limit).offset(offset).orderBy(desc(workshopRegistration.createdAt));

    const countQuery = db.select({ value: count() }).from(workshopRegistration);
    const cQuery = conditions.length > 0 ? countQuery.where(and(...conditions)) : countQuery;
    const totalResult = await cQuery;
    const total = totalResult[0].value;

    return { data, total };
  } catch (err) {
    console.error(err);
    return { data: [], total: 0 };
  }
}

export async function getAllRegistrations(workshopId?: string) {
  try {
    await requireAdmin("full");
    const conditions = [];
    if (workshopId) conditions.push(eq(workshopRegistration.workshopId, workshopId));
    const data = db.select({
      id: workshopRegistration.id,
      name: workshopRegistration.name,
      email: workshopRegistration.email,
      mobileNumber: workshopRegistration.mobileNumber,
      designation: workshopRegistration.designation,
      instituteName: workshopRegistration.instituteName,
      city: workshopRegistration.city,
      modeOfAttandnace: workshopRegistration.modeOfAttandnace,
      workshopName: workshop.name,
      paymentStatus: workshopRegistration.paymentStatus,
    })
      .from(workshopRegistration)
      .leftJoin(workshop, eq(workshopRegistration.workshopId, workshop.id))
    // .leftJoin(workshopPayment, eq(workshopRegistration.id, workshopPayment.registrationId));

    const finalData = conditions.length > 0 ? data.where(and(...conditions)) : data;
    const result = await finalData;

    return result;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getWorkshopsList() {
  try {
    await requireAdmin("full");
    return await db.select({ id: workshop.id, name: workshop.name }).from(workshop);
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getCertificateUser(workshopId: string, searchType: "email" | "number", searchValue: string) {
  try {
    const field = searchType === "email" ? workshopRegistration.email : workshopRegistration.mobileNumber;
    const query = db.select({ certificateUrl: workshopRegistration.certificateUrl })
      .from(workshopRegistration)
      .where(
        and(
          eq(workshopRegistration.workshopId, workshopId),
          eq(field, searchValue),
          eq(workshopRegistration.paymentStatus, 'completed')
        )
      )
      .limit(1);

    const result = await query;
    if (result.length > 0) {
      return { success: true, certificateUrl: result[0].certificateUrl };
    }
    return { success: false, message: "No registration found with provided details." };
  } catch (err) {
    console.error(err);
    return { success: false, message: "An error occurred while fetching certificate." };
  }
}
