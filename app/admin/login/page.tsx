"use client"

import { useState } from "react"
import { loginAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const [error, setError] = useState("")

  async function handleSubmit(formData: FormData) {
    // Basic clearing of standard errors
    setError("")
    
    const res = await loginAction(formData)
    
    // We only reach this path if returned an error
    if (res?.error) {
      setError(res.error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-600">Enter the admin password to continue.</p>
        </div>
        
        <form action={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-2">
              <Input
                name="password"
                type="password"
                required
                className="w-full"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>}
          </div>

          <Button type="submit" className="w-full">
            Log in
          </Button>
        </form>
      </div>
    </div>
  )
}
