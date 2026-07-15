import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with an approved admin email to continue.
          </p>
        </div>

        <Button asChild className="w-full">
          <Link href="/sign-in?callbackUrl=/admin">Sign in</Link>
        </Button>
      </div>
    </div>
  )
}
