"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { AWS_ACCESS_KEY, AWS_BUCKET, AWS_REGION, AWS_SECRET_KEY } from "@/env";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

export async function getPresignedUrl(filename: string, fileType: string): Promise<{ url?: string; uploadUrl?: string; error?: string }> {
  try {
    const key = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const finalUrl = `https://${AWS_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, url: finalUrl };
  } catch (error) {
    console.error("Presigned URL Error:", error);
    return { error: "Failed to generate presigned upload URL" };
  }
}
