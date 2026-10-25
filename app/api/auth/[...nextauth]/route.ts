import { handlers } from "../../../../auth";
import { withApiLogging } from "@/lib/logging/api";

export const GET = withApiLogging("/api/auth/[...nextauth]", handlers.GET);
export const POST = withApiLogging("/api/auth/[...nextauth]", handlers.POST);
