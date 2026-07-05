import AuthLayout from "@/components/auth/auth-layout";
import VerifyEmailForm from "@/components/auth/verify-email-form";
import { Suspense } from "react";

export default function Page() {
  return (
    <AuthLayout
      title="Verify Email"
      description="Enter the verification code sent to your email to complete registration."
    >
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyEmailForm />
      </Suspense>
    </AuthLayout>
  );
}
