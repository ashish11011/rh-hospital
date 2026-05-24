"use server";

import { db } from "@/lib/dbConfig";
import { workshopRegistration, workshop } from "@/db/index";
import { eq, ilike, and, desc, count } from "drizzle-orm";

export async function getRegistrations({
  page = 1,
  limit = 20,
  emailFilter = "",
  workshopId = ""
}) {
  try {
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
    return await db.select({ id: workshop.id, name: workshop.name }).from(workshop);
  } catch (err) {
    console.error(err);
    return [];
  }
}
