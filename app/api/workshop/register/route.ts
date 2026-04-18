import { workshopPaymentSchema, workshopRegistrationSchema, workshopSchema } from "@/db/workshopSchema";
import { db } from "@/lib/dbConfig";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "@/lib/sesClient";






export async function POST(req: NextRequest) {
    const { workshopId, email, name, mobileNumber, designation, instituteName, city, modeOfAttandnace } = await req.json();

    const [workshopDetail] = await db.select().from(workshopSchema).where(eq(workshopSchema.id, workshopId));
    if (!workshopDetail) return notFound();
    const price = modeOfAttandnace === "online" ? workshopDetail.onlinePrice : workshopDetail.offlinePrice;

    try {
        const [registrationDetail] = await db.insert(workshopRegistrationSchema).values({
            workshopId,
            email,
            name,
            mobileNumber,
            designation,
            instituteName,
            city,
            modeOfAttandnace,
        }).returning({ id: workshopRegistrationSchema.id });
        await db.insert(workshopPaymentSchema).values({
            registrationId: registrationDetail.id,

            modeOfPayment: "UPI",
            gatewayOrderId: "",
            amount: price.toString(),
            transactionId: "",
            transactionDate: "",
            status: "pending",
            email: email,
            contact: mobileNumber,
            tokenId: "",
            responseObject: {},

        });

        // Sending mail

        var params = {
            Destination: {
                /* required */

                ToAddresses: [
                    email
                ],
            },
            Message: {
                /* required */
                Body: {
                    /* required */
                    Html: {
                        Charset: "UTF-8",
                        Data: `Hey ${name} your booking for the exibitions is confirmed!!!..😃`,
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: `Hey ${name} your booking for the exibitions is confirmed!!!..😃`,
                    },
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: "Booking conformation for exibitions",
                },
            },
            Source: "no-reply@ashishbishnoi.com" /* required */,
            ReplyToAddresses: [
                "bishnoi11011@gmail.com"
            ],
        };
        console.log(params)
        await sesClient.send(new SendEmailCommand(params));


    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Registration failed" });
    }
    return NextResponse.json({ message: "Registration successful" });
}
