import SignupForm from "@/components/auth/signup-form";
import AuthLayout from "@/components/auth/auth-layout";

export default function Page() {
    return (
        <AuthLayout
            title="Create Account"
            description="Create your RH Healthcare account."
        >
            <SignupForm />
        </AuthLayout>
    );
}