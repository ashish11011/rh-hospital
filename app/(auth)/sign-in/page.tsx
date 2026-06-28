import LoginForm from "@/components/auth/login-form";
import AuthLayout from "@/components/auth/auth-layout";

export default function Page() {
    return (
        <AuthLayout
            title="Sign In"
            description="Enter your credentials to access your clinical dashboard."
        >
            <LoginForm />
        </AuthLayout>
    );
}