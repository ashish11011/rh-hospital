import AuthLayout from "@/components/auth/auth-layout";
import ResetPasswordForm from "@/components/auth/reset-password-form";
import { Suspense } from "react";

export const dynamic = "force-static";

export default function Page() {
  return (
    <AuthLayout
      title="Reset Password"
      description="Enter the verification code sent to your email and your new password."
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
