"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signupWithCognito } from "@/lib/actions/auth";
import { AuthLink } from "./auth-link";
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
import { PasswordRequirements } from "./password-requirements";
import { usePendingCredentials } from "./pending-credentials";

export default function SignupForm() {
  const router = useRouter();
  const { setCredentials } = usePendingCredentials();
  const [error, setError] = useState<string | null>(null);
  const [existingAccount, setExistingAccount] = useState<{
    email: string;
    canVerify: boolean;
  } | null>(null);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupValues) => {
    setError(null);
    setExistingAccount(null);
    setCredentials(null);
    try {
      const res = await signupWithCognito(data);
      const emailQuery = `email=${encodeURIComponent(data.email)}`;
      if ("nextStep" in res && res.nextStep === "verify_email") {
        setCredentials({
          email: data.email.trim().toLowerCase(),
          password: data.password,
        });
        router.push(`/verify-email?${emailQuery}`);
      } else if ("nextStep" in res && res.nextStep === "reset_password") {
        router.push(`/forgot-password?${emailQuery}`);
      } else if ("error" in res) {
        setError("message" in res ? res.message : res.error);
        if (
          res.error === "exists" &&
          "nextStep" in res &&
          res.nextStep !== "none"
        ) {
          setExistingAccount({
            email: data.email,
            canVerify: res.nextStep === "choose",
          });
        }
      } else if (res.success) {
        setCredentials({
          email: data.email.trim().toLowerCase(),
          password: data.password,
        });
        router.push(`/verify-email?${emailQuery}`);
      }
    } catch {
      setError(
        "Unable to create your account. Please check your connection and try again.",
      );
    }
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <p>{error}</p>
            {existingAccount && (
              <div className="mt-3 flex flex-wrap gap-4">
                <AuthLink
                  href={`/sign-in?email=${encodeURIComponent(existingAccount.email)}`}
                >
                  Sign in
                </AuthLink>
                <AuthLink
                  href={`/forgot-password?email=${encodeURIComponent(existingAccount.email)}`}
                >
                  Reset password
                </AuthLink>
                {existingAccount.canVerify && (
                  <AuthLink
                    href={`/verify-email?email=${encodeURIComponent(existingAccount.email)}`}
                  >
                    Verify email
                  </AuthLink>
                )}
              </div>
            )}
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
        <PasswordRequirements password={form.watch("password") || ""} />
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
        Already have an account? <AuthLink href="/sign-in">Sign In</AuthLink>
      </p>
    </form>
  );
}
