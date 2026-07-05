import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";
import { auth } from "@/auth";

export default async function NotFound() {
    const session = await auth();
    return (
        <div>
            <Navbar session={session} />
            <div className="min-h-screen bg-linear-to-b from-white to-slate-50 flex items-center justify-center px-6">
                <div className="max-w-2xl text-center">

                    {/* Error Code */}
                    <h1 className="text-8xl font-bold text-primary">404</h1>

                    {/* Title */}
                    <h2 className="mt-4 text-3xl font-bold text-slate-900">
                        Page Not Found
                    </h2>

                    {/* Description */}
                    <p className="mt-4 text-slate-600 text-lg">
                        The page you're looking for may have been moved, deleted, or the URL
                        might be incorrect.
                    </p>

                    {/* Actions */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-medium hover:bg-primary transition"
                        >
                            <Home size={18} />
                            Go to Homepage
                        </Link>
                    </div>

                    {/* Footer Text */}
                    <p className="mt-10 text-sm text-slate-500">
                        Need assistance? Contact RH Healthcare Support.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}