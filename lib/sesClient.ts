import { SES_ACCESS_KEY, SES_SECRET_ACCESS_KEY } from "@/env";
import { SESClient, ListIdentitiesCommand } from "@aws-sdk/client-ses";

export const sesClient = new SESClient({
    region: "ap-south-1",
    credentials: {
        accessKeyId: SES_ACCESS_KEY,
        secretAccessKey: SES_SECRET_ACCESS_KEY,
    },
});