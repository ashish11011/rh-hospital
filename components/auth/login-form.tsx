"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginWithCredentials } from "@/lib/actions/auth";

import { loginSchema, LoginValues } from "@/lib/validations/auth";
import Link from "next/link";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import PasswordInput from "./password-input";
import GoogleButton from "./google-button";
import { useForm } from "react-hook-form";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginValues) => {
    setError(null);
    const res = await loginWithCredentials(data);

    if (res?.error === "unconfirmed") {
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } else if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <Label>Email Address</Label>

        <div className="relative">
          <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

          <Input
            type="email"
            placeholder="dr.smith@hospital.org"
            className="h-12 rounded-xl pl-10"
            {...form.register("email")}
          />
        </div>
        <p className="text-sm text-red-500">
          {form.formState.errors.email?.message}
        </p>
      </div>

      <div className="space-y-2">
        <Label>Password</Label>

        <PasswordInput {...form.register("password")} placeholder="••••••••" />
        <p className="text-sm text-red-500">
          {form.formState.errors.password?.message}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox id="remember" />
          <Label htmlFor="remember">Remember me</Label>
        </div>

        <Link
          href="/forgot-password"
          className="text-primary text-sm font-medium hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        className="h-11 w-full font-bold"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Signing In..." : "Sign In"}
      </Button>

      {/* <div className="relative">
        <Separator />

        <span className="text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs tracking-widest whitespace-nowrap uppercase">
          OR CONTINUE WITH
        </span>
      </div>

      <GoogleButton /> */}

      <p className="text-muted-foreground text-center text-sm">
        Don't have an account?{" "}
        <Link href="/sign-up" className="text-primary font-semibold">
          Create Account
        </Link>
      </p>
    </form>
  );
}
