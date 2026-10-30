"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  confirmWithCognito,
  loginWithCredentials,
  resendVerificationCode,
} from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { AuthLink, AUTH_LINK_CLASS_NAME } from "./auth-link";
import PasswordInput from "./password-input";
import { usePendingCredentials } from "./pending-credentials";

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = (searchParams.get("email") || "").trim().toLowerCase();
  const { credentials, setCredentials } = usePendingCredentials();
  const pendingPassword =
    credentials?.email === email ? credentials.password : "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!isVerified && !code) {
      setError("Please enter the verification code");
      return;
    }
    const loginPassword = pendingPassword || password;
    if (!loginPassword) {
      setError("Enter your password to finish signing in.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (!isVerified) {
        const res = await confirmWithCognito({ email, code });
        if (res?.error) {
          setError(res.error);
          return;
        }
        setIsVerified(true);
      }

      const res = await loginWithCredentials({
        email,
        password: loginPassword,
      });
      if (res?.error) {
        setCredentials(null);
        setPassword("");
        setError(
          res.error === "unconfirmed"
            ? "Unable to sign in. Please try again."
            : res.error,
        );
        return;
      }

      setCredentials(null);
      setPassword("");
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to finish verification and sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-500"
          >
            {error}
          </div>
        )}

        {isVerified ? (
          <p className="text-sm">
            Your email is verified. Finish signing in below.
          </p>
        ) : (
          <>
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              autoComplete="one-time-code"
              placeholder="Enter 6-digit code"
              className="h-12 rounded-xl"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-muted-foreground text-sm">
              Code sent to {email}
            </p>
          </>
        )}
      </div>

      {!pendingPassword && (
        <div className="space-y-2">
          <Label htmlFor="verification-password">Password</Label>
          <PasswordInput
            id="verification-password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
          <p className="text-muted-foreground text-sm">
            Enter your account password to sign in automatically.
          </p>
        </div>
      )}

      <Button
        className="h-11 w-full font-bold"
        disabled={isSubmitting || !email}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isVerified ? "Signing In..." : "Verifying..."}
          </>
        ) : isVerified ? (
          "Sign In"
        ) : (
          "Verify Account"
        )}
      </Button>

      {!isVerified && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-muted-foreground text-center text-sm">
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={isSubmitting}
            className={`text-sm ${AUTH_LINK_CLASS_NAME}`}
          >
            Resend Code
          </button>
          <AuthLink href="/sign-up" className="mt-2 text-sm">
            Sign up with a different email
          </AuthLink>
        </div>
      )}
    </form>
  );
}
