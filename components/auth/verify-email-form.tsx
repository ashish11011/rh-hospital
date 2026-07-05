"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmWithCognito, resendVerificationCode } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setError("Please enter the verification code");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    const res = await confirmWithCognito({ email, code });
    
    if (res?.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else if (res?.success) {
      router.push("/sign-in?registered=true");
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setError(null);
    const res = await resendVerificationCode(email);
    if (res?.error) {
      setError(res.error);
    } else {
      setError("Code resent successfully! Please check your email.");
    }
  };

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}
        
        <Label>Verification Code</Label>
        
        <Input
          placeholder="Enter 6-digit code"
          className="h-12 rounded-xl"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Code sent to {email}
        </p>
      </div>

      <Button
        className="h-11 w-full font-bold"
        disabled={isSubmitting || !email}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify Account"
        )}
      </Button>

      <div className="flex flex-col items-center gap-2 mt-4">
        <p className="text-muted-foreground text-center text-sm">
          Didn't receive the code?
        </p>
        <button
          type="button"
          onClick={handleResend}
          className="text-primary font-semibold text-sm hover:underline"
        >
          Resend Code
        </button>
        <Link href="/sign-up" className="text-sm font-semibold mt-2 hover:underline">
          Sign up with a different email
        </Link>
      </div>
    </form>
  );
}
