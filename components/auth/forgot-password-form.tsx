"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordValues } from "@/lib/validations/auth";
import { forgotPasswordWithCognito } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail } from "lucide-react";
import { AuthLink } from "./auth-link";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setError(null);
    const res = await forgotPasswordWithCognito(data.email);
    
    if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
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
          />
        </div>
        <p className="text-sm text-red-500">
          {form.formState.errors.email?.message}
        </p>
      </div>

      <Button
        className="h-11 w-full font-bold"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Code...
          </>
        ) : (
          "Send Reset Code"
        )}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Remember your password?{" "}
        <AuthLink href="/sign-in">
          Sign In
        </AuthLink>
      </p>
    </form>
  );
}
