import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, context: { params: Promise<{ slug: string; }>; }) {
    try {
        const { name, email } = await req.json();
        const { slug } = await context.params;
        console.log("Slug", slug);
        console.log("Name", name);
        console.log("Email", email);

        // const { url: certificateUrl } = await generateAndUploadCertificate(name, slug);


    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ message: "Failed to generate certificate" }, { status: 500 });
    }

    return NextResponse.json({ message: "Certificate generated successfully" });
}