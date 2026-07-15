import AuthLayout from "@/components/auth/auth-layout";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export const dynamic = "force-static";

export default function Page() {
  return (
    <AuthLayout
      title="Forgot Password"
      description="Enter your email to receive a password reset code."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
