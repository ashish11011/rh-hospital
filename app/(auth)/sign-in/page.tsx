import LoginForm from "@/components/auth/login-form";
import AuthLayout from "@/components/auth/auth-layout";
import { Suspense } from "react";

export default function Page() {
    return (
        <AuthLayout
            title="Sign In"
            description="Enter your credentials to access your clinical dashboard."
        >
            <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
            </Suspense>
        </AuthLayout>
    );
}
