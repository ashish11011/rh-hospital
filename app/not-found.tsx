import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div>
      <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-white to-slate-50 px-6">
        <div className="max-w-2xl text-center">
          {/* Error Code */}
          <h1 className="text-primary text-8xl font-bold">404</h1>

          {/* Title */}
          <h2 className="mt-4 text-3xl font-bold text-slate-900">
            Page Not Found
          </h2>

          {/* Description */}
          <p className="mt-4 text-lg text-slate-600">
            The page you're looking for may have been moved, deleted, or the URL
            might be incorrect.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="bg-primary hover:bg-primary inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition"
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
    </div>
  );
}
