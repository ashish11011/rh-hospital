"use server";
import { instrumentAwsClient } from "@/lib/logging/aws";

import { runLoggedOperation } from "@/lib/logging/operations";
import { createLogger } from "@/lib/logging/logger";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { AWS_ACCESS_KEY, AWS_BUCKET, AWS_REGION, AWS_SECRET_KEY } from "@/env";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireAdmin } from "@/lib/adminAuth";
import { publicAssetKey } from "@/lib/publicAsset";

const logger = createLogger("integration", "actions/uploadAction.ts");

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});
instrumentAwsClient(s3Client, "actions/uploadAction.ts");

function createS3Key(filename: string, folder?: string) {
  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const cleanFolder = folder
    ?.replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9/_-]/g, "_");
  const key = `${Date.now()}-${safeFilename}`;

  return publicAssetKey(cleanFolder ? `${cleanFolder}/${key}` : key);
}

type PresignedUploadResult = {
  uploadUrl?: string;
  key?: string;
  error?: string;
};

export async function getPresignedUrl(
  filename: string,
  fileType: string,
  folder?: string,
): Promise<PresignedUploadResult> {
  return runLoggedOperation(
    "integration",
    "actions/uploadAction.ts:getPresignedUrl",
    async () => {
      try {
        await requireAdmin("full");
        const key = createS3Key(filename, folder);

        const command = new PutObjectCommand({
          Bucket: AWS_BUCKET,
          Key: key,
          ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        return { uploadUrl, key };
      } catch (error) {
        logger.error("Presigned URL Error:", { details: [error] });
        return { error: "Failed to generate presigned upload URL" };
      }
    },
    true,
  );
}

export async function getBlogImagePresignedUrl(
  filename: string,
  fileType: string,
): Promise<PresignedUploadResult> {
  return runLoggedOperation(
    "integration",
    "actions/uploadAction.ts:getBlogImagePresignedUrl",
    async () => {
      try {
        await requireAdmin("blog");

        if (!fileType.startsWith("image/")) {
          return { error: "Only image uploads are allowed" };
        }

        const key = createS3Key(filename, "blogs");

        const command = new PutObjectCommand({
          Bucket: AWS_BUCKET,
          Key: key,
          ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        return { uploadUrl, key };
      } catch (error) {
        logger.error("Presigned URL Error:", { details: [error] });
        return { error: "Failed to generate presigned upload URL" };
      }
    },
    true,
  );
}

export async function getWorkshopImagePresignedUrl(
  filename: string,
  fileType: string,
  kind: "banner" | "gallery",
): Promise<PresignedUploadResult> {
  return runLoggedOperation(
    "integration",
    "actions/uploadAction.ts:getWorkshopImagePresignedUrl",
    async () => {
      try {
        await requireAdmin("workshop");

        if (!fileType.startsWith("image/")) {
          return { error: "Only image uploads are allowed" };
        }
        if (kind !== "banner" && kind !== "gallery") {
          return { error: "Invalid workshop image folder" };
        }

        const key = createS3Key(filename, `workshops/${kind}`);
        const command = new PutObjectCommand({
          Bucket: AWS_BUCKET,
          Key: key,
          ContentType: fileType,
        });
        const uploadUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        return { uploadUrl, key };
      } catch (error) {
        logger.error("Presigned URL Error:", { details: [error] });
        return { error: "Failed to generate presigned upload URL" };
      }
    },
    true,
  );
}
