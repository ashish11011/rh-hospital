import { auth } from "@/auth";
import { course, courseEnrolment, payment, user } from "@/db";
import { db } from "@/lib/dbConfig";
import { createHdfcCustomerId, createHdfcGatewayOrderId, createHdfcPaymentSession } from "@/lib/hdfcGateway";
import { sendCoursePurchaseEmail } from "@/lib/sesClient";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();

  if (!email) {
    return NextResponse.json({ message: "Please sign in to purchase this course" }, { status: 401 });
  }

  const { courseId } = await req.json();
  if (!courseId) {
    return NextResponse.json({ message: "Course is required" }, { status: 400 });
  }

  try {
    const [profile] = await db.select().from(user).where(eq(user.email, email)).limit(1);
    if (!profile) {
      return NextResponse.json({ message: "Complete your profile before purchasing a course" }, { status: 400 });
    }

    const [courseDetail] = await db.select().from(course).where(eq(course.id, courseId)).limit(1);
    if (!courseDetail || courseDetail.isActive === false) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    const [latestEnrolment] = await db
      .select()
      .from(courseEnrolment)
      .where(and(eq(courseEnrolment.courseId, courseId), eq(courseEnrolment.userId, profile.id)))
      .orderBy(desc(courseEnrolment.createdAt))
      .limit(1);

    if (latestEnrolment?.enrolmentStatus === "enrolled") {
      return NextResponse.json({ message: "You are already enrolled in this course" }, { status: 409 });
    }

    const [enrolment] = latestEnrolment?.enrolmentStatus === "pending"
      ? [latestEnrolment]
      : await db
        .insert(courseEnrolment)
        .values({
          courseId,
          userId: profile.id,
          enrolmentStatus: courseDetail.price > 0 ? "pending" : "enrolled",
        })
        .returning({ id: courseEnrolment.id, enrolmentStatus: courseEnrolment.enrolmentStatus });

    if (courseDetail.price <= 0) {
      if (enrolment.enrolmentStatus !== "enrolled") {
        await db
          .update(courseEnrolment)
          .set({ enrolmentStatus: "enrolled", updatedAt: new Date() })
          .where(eq(courseEnrolment.id, enrolment.id));
      }
      await sendCoursePurchaseEmail({
        toEmail: email,
        name: profile.name,
        courseTitle: courseDetail.title,
      });
      return NextResponse.json({ message: "Course enrolled successfully", freeEnrollment: true });
    }


    const gatewayOrderId = createHdfcGatewayOrderId();
    const hdfcPaymentSession = await createHdfcPaymentSession({
      gatewayOrderId,
      amount: courseDetail.price,
      customerId: createHdfcCustomerId(profile.id),
      customerEmail: email.toLowerCase(),
      customerPhone: profile.mobileNumber,
      customerName: profile.name,
      description: "Course purchase payment",
    });

    await db.insert(payment).values({
      orderType: "course",
      orderId: enrolment.id,
      gatewayOrderId,
      gatewayInvoiceId: hdfcPaymentSession.id,
      amount: courseDetail.price,
      amountDue: courseDetail.price,
      currency: "INR",
      email: email.toLowerCase(),
      contact: profile.mobileNumber,
      status: hdfcPaymentSession.status || "pending",
      responseObject: hdfcPaymentSession as any,
    });

    // const gatewayPaymentOrder = await paymentClient.orders.create({
    //   amount: courseDetail.price * 100,
    //   currency: courseDetail.currency || "INR",
    //   receipt: enrolment.id,
    // });

    // await db.insert(payment).values({
    //   orderType: "course",
    //   orderId: enrolment.id,
    //   gatewayOrderId: gatewayPaymentOrder.id,
    //   amount: courseDetail.price,
    //   amountDue: courseDetail.price,
    //   currency: gatewayPaymentOrder.currency,
    //   email,
    //   contact: profile.mobileNumber,
    //   description: `Course purchase: ${courseDetail.title}`,
    // });

    return NextResponse.json({
      message: "Course purchase started",
      data: {
        orderId: gatewayOrderId,
        gatewaySessionId: hdfcPaymentSession.id,
        amount: courseDetail.price,
        currency: courseDetail.currency || "INR",
        status: hdfcPaymentSession.status,
        paymentUrl: hdfcPaymentSession.payment_links?.web,
        expiresAt: hdfcPaymentSession.payment_links?.expiry || hdfcPaymentSession.order_expiry,
      },
    });
  } catch (error) {
    console.error("Course purchase error:", error);
    return NextResponse.json({ message: "Course purchase failed" }, { status: 500 });
  }
}
