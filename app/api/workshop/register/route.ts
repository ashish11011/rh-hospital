import { workshopSchema } from "@/db/workshopSchema";
import { db } from "@/lib/dbConfig";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { userSchema } from "@/db/userSchema";
import { paymentClient } from "@/lib/paymentClient";


export async function POST(req: NextRequest) {
    const { workshopId, email, name, mobileNumber, designation, instituteName, city, modeOfAttandnace } = await req.json();

    const [workshopDetail] = await db.select().from(workshopSchema).where(eq(workshopSchema.id, workshopId));
    if (!workshopDetail) return notFound();
    const price = modeOfAttandnace === "online" ? workshopDetail.onlinePrice : workshopDetail.offlinePrice;

    if (!email || !name || !mobileNumber || !designation || !instituteName || !city || !modeOfAttandnace || !workshopId) return NextResponse.json({ message: "All fields are required" });

    let userId;
    const [user] = await db.select().from(userSchema).where(eq(userSchema.email, email));

    if (user) {
        userId = user.id;
    }

    if (!user) {
        const [newUser] = await db.insert(userSchema).values({
            email,
            name,
            mobileNumber,
            designation,
            instituteName,
            password: ""
        }).returning({ id: userSchema.id });
        userId = newUser.id;
    }

    try {


        // const [registrationDetail] = await db.insert(workshopRegistration).values({
        //     workshopId,
        //     userId: userId!,
        //     email,
        //     name,
        //     mobileNumber,
        //     designation,
        //     instituteName,
        //     city,
        //     modeOfAttandnace,
        // }).returning({ id: workshopRegistration.id });

        const [workshopInfo] = await db.select().from(workshopSchema).where(eq(workshopSchema.id, workshopId));

        const paymentModeAmount = modeOfAttandnace === "online" ? workshopInfo.onlinePrice : workshopInfo.offlinePrice;

        var options = {
            amount: paymentModeAmount * 100,
            currency: "INR",
            receipt: "order_rcptid_11"
        };

        const paymentOrder = await paymentClient.orders.create(options);
        console.log(paymentOrder);



        // const paymentCreationResponse = 
        // console.log(paymentCreationResponse.data);

        // await db.insert(payment).values({
        //     orderType: "workshop",
        //     orderId: registrationDetail.id,
        //     modeOfPayment: "UPI",
        //     gatewayOrderId: "",
        //     amount: price.toString(),
        //     transactionId: "",
        //     transactionDate: "",
        //     status: "pending",
        //     email: email,
        //     contact: mobileNumber,
        //     tokenId: "",
        //     responseObject: {},
        // });

        // Sending mail

        // var params = {
        //     Destination: {
        //         /* required */

        //         ToAddresses: [
        //             email
        //         ],
        //     },
        //     Message: {
        //         /* required */
        //         Body: {
        //             /* required */
        //             Html: {
        //                 Charset: "UTF-8",
        //                 Data: `Hey ${name} your booking for the exibitions is confirmed!!!..😃`,
        //             },
        //             Text: {
        //                 Charset: "UTF-8",
        //                 Data: `Hey ${name} your booking for the exibitions is confirmed!!!..😃`,
        //             },
        //         },
        //         Subject: {
        //             Charset: "UTF-8",
        //             Data: "Booking conformation for exibitions",
        //         },
        //     },
        //     Source: "no-reply@ashishbishnoi.com" /* required */,
        //     ReplyToAddresses: [
        //         "bishnoi11011@gmail.com"
        //     ],
        // };
        // console.log(params)
        // await sesClient.send(new SendEmailCommand(params));

        return NextResponse.json({ message: "Registration successful", data: paymentOrder });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Registration failed" });
    }
}
