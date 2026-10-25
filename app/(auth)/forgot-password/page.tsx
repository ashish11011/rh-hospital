import AuthLayout from "@/components/auth/auth-layout";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import { Suspense } from "react";

export const dynamic = "force-static";

export default function Page() {
  return (
    <AuthLayout
      title="Forgot Password"
      description="Enter your email to receive a password reset code."
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
