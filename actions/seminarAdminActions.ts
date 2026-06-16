"use server";

import { db } from "@/lib/dbConfig";
import { seminarRegistrations, seminar } from "@/db/index";
import { eq, ilike, and, desc, count } from "drizzle-orm";

export async function getSeminarRegistrations({
  page = 1,
  limit = 20,
  emailFilter = "",
  seminarId = ""
}) {
  try {
    const conditions = [];
    if (emailFilter) conditions.push(ilike(seminarRegistrations.email, `%${emailFilter}%`));
    if (seminarId) conditions.push(eq(seminarRegistrations.seminarId, seminarId));

    const offset = (page - 1) * limit;

    const baseQuery = db.select({
      id: seminarRegistrations.id,
      name: seminarRegistrations.name,
      email: seminarRegistrations.email,
      mobileNumber: seminarRegistrations.mobileNumber,
      designation: seminarRegistrations.designation,
      instituteName: seminarRegistrations.instituteName,
      city: seminarRegistrations.city,
      registrationMode: seminarRegistrations.registrationMode,
      seminarName: seminar.name,
      paymentStatus: seminarRegistrations.paymentStatus,
      amount: seminarRegistrations.amount,
    })
      .from(seminarRegistrations)
      .leftJoin(seminar, eq(seminarRegistrations.seminarId, seminar.id));

    const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    const data = await query.limit(limit).offset(offset).orderBy(desc(seminarRegistrations.createdAt));

    const countQuery = db.select({ value: count() }).from(seminarRegistrations);
    const cQuery = conditions.length > 0 ? countQuery.where(and(...conditions)) : countQuery;
    const totalResult = await cQuery;
    const total = totalResult[0].value;

    return { data, total };
  } catch (err) {
    console.error(err);
    return { data: [], total: 0 };
  }
}

export async function getAllSeminarRegistrations(seminarId?: string) {
  try {
    const conditions = [];
    if (seminarId) conditions.push(eq(seminarRegistrations.seminarId, seminarId));
    const data = db.select({
      id: seminarRegistrations.id,
      name: seminarRegistrations.name,
      email: seminarRegistrations.email,
      mobileNumber: seminarRegistrations.mobileNumber,
      gender: seminarRegistrations.gender,
      designation: seminarRegistrations.designation,
      qualification: seminarRegistrations.qualification,
      instituteName: seminarRegistrations.instituteName,
      addressLine1: seminarRegistrations.addressLine1,
      addressLine2: seminarRegistrations.addressLine2,
      city: seminarRegistrations.city,
      state: seminarRegistrations.state,
      country: seminarRegistrations.country,
      pincode: seminarRegistrations.pincode,
      paperPresentation: seminarRegistrations.paperPresentation,
      paperTitle: seminarRegistrations.paperTitle,
      authorName: seminarRegistrations.authorName,
      paperInstitution: seminarRegistrations.paperInstitution,
      additionalDetails: seminarRegistrations.additionalDetails,
      referenceType: seminarRegistrations.referenceType,
      referencePersonName: seminarRegistrations.referencePersonName,
      referencePersonMobile: seminarRegistrations.referencePersonMobile,
      socialMediaName: seminarRegistrations.socialMediaName,
      registrationMode: seminarRegistrations.registrationMode,
      offlineDuration: seminarRegistrations.offlineDuration,
      isNaitMember: seminarRegistrations.isNaitMember,
      naitRegistrationId: seminarRegistrations.naitRegistrationId,
      amount: seminarRegistrations.amount,
      paymentStatus: seminarRegistrations.paymentStatus,
      paymentId: seminarRegistrations.paymentId,
      orderId: seminarRegistrations.orderId,
      createdAt: seminarRegistrations.createdAt,
      updatedAt: seminarRegistrations.updatedAt,
      utmSource: seminarRegistrations.utmSource,
      utmMedium: seminarRegistrations.utmMedium,
      utmCampaign: seminarRegistrations.utmCampaign,
      utmContent: seminarRegistrations.utmContent,
      certificateUrl: seminarRegistrations.certificateUrl,
      seminarName: seminar.name,
    })
      .from(seminarRegistrations)
      .leftJoin(seminar, eq(seminarRegistrations.seminarId, seminar.id));

    const finalData = conditions.length > 0 ? data.where(and(...conditions)) : data;
    const result = await finalData;

    return result;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getSeminarsList() {
  try {
    return await db.select({ id: seminar.id, name: seminar.name }).from(seminar);
  } catch (err) {
    console.error(err);
    return [];
  }
}
