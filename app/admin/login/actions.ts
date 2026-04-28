"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const password = formData.get("password") as string
  
  // You can set ADMIN_PASSWORD in your .env file.
  // Using "admin123" as fallback for now.
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123"
  
  if (password === adminPassword) {
    const cookieStore = await cookies()
    cookieStore.set("admin_token", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })
    
    redirect("/admin")
  } else {
    return { error: "Invalid password" }
  }
}
