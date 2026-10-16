import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { userSchema } from "@/db/userSchema";
import { AWS_ACCESS_KEY, AWS_BUCKET, AWS_REGION, AWS_SECRET_KEY } from "@/env";
import { publicAssetKey, publicAssetUrl } from "@/lib/publicAsset";
import { db } from "@/lib/dbConfig";
import { getAuthenticatedApiEmail } from "@/lib/mobileApiAuth";

export const dynamic = "force-dynamic";

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeFilename(filename: string) {
  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return safeFilename || "passport-photo.jpg";
}

async function getAuthenticatedUser(req: Request) {
  const email = await getAuthenticatedApiEmail(req);

  if (!email) return null;

  const [account] = await db
    .select({ id: userSchema.id, email: userSchema.email })
    .from(userSchema)
    .where(eq(userSchema.email, email))
    .limit(1);

  return account || null;
}

export async function POST(req: Request) {
  try {
    const account = await getAuthenticatedUser(req);

    if (!account) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token or session" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const filename = sanitizeFilename(cleanString(body.filename));
    const fileType = cleanString(body.fileType).toLowerCase();

    if (!ALLOWED_IMAGE_TYPES.has(fileType)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, or WEBP images are allowed" },
        { status: 400 },
      );
    }

    const key = publicAssetKey(`membership-cards/${account.id}/${Date.now()}-${filename}`);
    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET,
      Key: key,
      ContentType: fileType,
    });
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    return NextResponse.json(
      {
        success: true,
        uploadUrl,
        key,
        cloudfrontUrl: publicAssetUrl(key),
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create upload URL" },
      { status: 500 },
    );
  }
}
