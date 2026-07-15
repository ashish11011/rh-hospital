import { auth } from "@/auth";
import { extractEmailFromToken } from "@/lib/verify-token";

export async function getAuthenticatedApiEmail(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (token) {
    const tokenEmail = await extractEmailFromToken(token);
    return tokenEmail?.toLowerCase() || null;
  }

  const session = await auth();
  return session?.user?.email?.toLowerCase() || null;
}
