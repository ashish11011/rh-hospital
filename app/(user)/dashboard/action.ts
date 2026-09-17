import { auth } from "@/auth";
import { payment, seminar, seminarRegistrations, workshop, workshopRegistration } from "@/db";
import { getUserProfile } from "@/lib/actions/profile";
import { db } from "@/lib/dbConfig";
import { getUserPurchasesByEmail } from "@/lib/userDashboardData";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function checkAuthGetUser(){
  const session = await auth();
  const userName = session?.user?.name || session?.user?.email || "User";

  if (!session?.user?.email) {
    redirect("/sign-in");
  }

  return await getUserProfile(session.user.email);
}

export async function getUserCertificate(){
  const userProfile = await checkAuthGetUser();
  if(!userProfile) return redirect('/sign-in');
  const workshopCertificates = await db.select({
    certificate: workshopRegistration.certificateUrl,
    workshopName: workshop.name,
    workshopId: workshop.id,
    workshopImage: workshop.bannerImage,
    workshopTime: workshop.startTime
  }).from(workshopRegistration).where(and(
    eq(workshopRegistration.userId, userProfile.id),
    isNotNull(workshopRegistration.certificateUrl)
  )).innerJoin(workshop, eq(workshop.id, workshopRegistration.workshopId));
  const seminarCertificates = await db.select({
    certificate: seminarRegistrations.certificateUrl,
    workshopName: seminar.name,
    workshopId: seminar.id,
    workshopImage: seminar.bannerImage,
    workshopTime: seminar.startTime
  }).from(seminarRegistrations).where(and(
    eq(seminarRegistrations.userId, userProfile.id),
    isNotNull(seminarRegistrations.certificateUrl)
  )).innerJoin(seminar, eq(seminar.id, seminarRegistrations.seminarId));
  return {
    workshopCertificates,
    seminarCertificates
  }
}

export async function getUserRegisteredWorkshops(){
  const userProfile = await checkAuthGetUser();
  if(!userProfile) return redirect('/sign-in');
  
  const registeredWorkshops = await db.select({
    workshopName: workshop.name,
    workshopId: workshop.id,
    workshopImage: workshop.bannerImage,
    workshopTime: workshop.startTime,
    isCompleted: workshop.isCompleted,
    paymentStatus: workshopRegistration.paymentStatus,
    modeOfAttendance: workshopRegistration.modeOfAttandnace,
    whatsappLink: workshop.whatsappLink
  }).from(workshopRegistration).where(
    and(
      eq(workshopRegistration.userId, userProfile.id),
      eq(workshopRegistration.paymentStatus, "completed")
    )
  ).innerJoin(workshop, eq(workshop.id, workshopRegistration.workshopId));
  
  return registeredWorkshops;
}

export async function getUserOrders(){
  const session = await auth();
  if(!session?.user?.email) return redirect('/sign-in');

  return getUserPurchasesByEmail(session.user.email);
}
