"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordValues } from "@/lib/validations/auth";
import { resetPasswordWithCognito } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail } from "lucide-react";
import PasswordInput from "./password-input";
import Link from "next/link";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [error, setError] = useState<string | null>(null);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: initialEmail, code: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    setError(null);
    const res = await resetPasswordWithCognito(data);
    
    if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      router.push("/sign-in?reset=true");
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
        
        <Label>Email Address</Label>
        <div className="relative">
          <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="email"
            placeholder="john@example.com"
            className="h-12 rounded-xl pl-10"
            {...form.register("email")}
            readOnly={!!initialEmail}
          />
        </div>
        <p className="text-sm text-red-500">{form.formState.errors.email?.message}</p>
      </div>

      <div className="space-y-2">
        <Label>Verification Code</Label>
        <Input
          placeholder="Enter the code sent to your email"
          className="h-12 rounded-xl"
          {...form.register("code")}
        />
        <p className="text-sm text-red-500">{form.formState.errors.code?.message}</p>
      </div>

      <div className="space-y-2">
        <Label>New Password</Label>
        <PasswordInput {...form.register("password")} placeholder="••••••••" />
        <p className="text-sm text-red-500">{form.formState.errors.password?.message}</p>
      </div>

      <div className="space-y-2">
        <Label>Confirm New Password</Label>
        <PasswordInput {...form.register("confirmPassword")} placeholder="••••••••" />
        <p className="text-sm text-red-500">{form.formState.errors.confirmPassword?.message}</p>
      </div>

      <Button
        className="h-11 w-full font-bold"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Resetting...
          </>
        ) : (
          "Reset Password"
        )}
      </Button>
      
      <p className="text-muted-foreground text-center text-sm">
        Remembered your password?{" "}
        <Link href="/sign-in" className="text-primary font-semibold">
          Sign In
        </Link>
      </p>
    </form>
  );
}
