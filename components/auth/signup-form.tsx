"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signupWithCognito } from "@/lib/actions/auth";
import Link from "next/link";
import { Mail, User, Phone, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import PasswordInput from "./password-input";
import GoogleButton from "./google-button";
import { useForm } from "react-hook-form";
import { signupSchema, SignupValues } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";

export default function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupValues) => {
    setError(null);
    const res = await signupWithCognito(data);

    if (res?.error === "exists") {
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } else if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    }
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <Label>Full Name</Label>

        <div className="relative">
          <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

          <Input
            placeholder="John Doe"
            className="h-12 rounded-xl pl-10"
            {...form.register("name")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Email</Label>

        <div className="relative">
          <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

          <Input
            type="email"
            placeholder="john@example.com"
            className="h-12 rounded-xl pl-10"
            {...form.register("email")}
          />
        </div>
      </div>

      {/* <div className="space-y-2">
        <Label>Phone</Label>

        <div className="relative">
          <Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

          <Input
            placeholder="+91 9876543210"
            className="h-12 rounded-xl pl-10"
            {...form.register("phone")}
          />
        </div>
      </div> */}

      <div className="space-y-2">
        <Label>Password</Label>
        <PasswordInput {...form.register("password")} />
        <p className="text-sm text-red-500">
          {form.formState.errors.password?.message}
        </p>
      </div>

      <div className="space-y-2">
        <Label>Confirm Password</Label>
        <PasswordInput {...form.register("confirmPassword")} />
        <p className="text-sm text-red-500">
          {form.formState.errors.confirmPassword?.message}
        </p>
      </div>

      <Button
        className="h-11 w-full font-bold"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing Up...
          </>
        ) : (
          "Sign Up"
        )}
      </Button>

      {/* <div className="relative">
        <Separator />

        <span className="text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs tracking-widest uppercase">
          OR CONTINUE WITH
        </span>
      </div>

      <GoogleButton /> */}

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-blue-600">
          Sign In
        </Link>
      </p>
    </form>
  );
}
