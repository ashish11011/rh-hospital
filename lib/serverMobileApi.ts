import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getRequestOrigin() {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("x-forwarded-host") || incomingHeaders.get("host");
  const protocol = incomingHeaders.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");

  if (!host) throw new Error("Unable to resolve request host");
  return `${protocol}://${host}`;
}

export async function fetchMobileApi<T>(path: string): Promise<T> {
  const incomingHeaders = await headers();
  const origin = await getRequestOrigin();
  const response = await fetch(`${origin}${path}`, {
    headers: {
      cookie: incomingHeaders.get("cookie") || "",
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/sign-in");
  }

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || payload.message || "API request failed");
  }

  return payload;
}
