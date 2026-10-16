import { BrandLogo } from "@/components/BrandLogo";
import LeftPanel from "./left-panel";
import { AuthLink } from "./auth-link";

interface Props {
  children: React.ReactNode;
  title: string;
  description: string;
}

export default function AuthLayout({ children, title, description }: Props) {
  return (
    <main className="min-h-screen bg-slate-100 md:p-5">
      <div className="mx-auto grid min-h-[95vh] max-w-7xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
        <LeftPanel />

        <section className="flex items-center justify-center p-4 lg:p-16">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center justify-center">
              <BrandLogo />
            </div>

            <div className="rounded-3xl border bg-white p-8 shadow-lg">
              <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>

              <p className="text-muted-foreground mt-2">{description}</p>

              <div className="mt-8">{children}</div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-4 text-center text-sm text-gray-500">
              <span>© 2026 RH Healthcare</span>

              <nav
                aria-label="Support and legal"
                className="flex flex-wrap justify-center gap-x-5 gap-y-2"
              >
                <AuthLink href="/contact-us">Support</AuthLink>
                <AuthLink href="/privacy-policy">Privacy Policy</AuthLink>
                <AuthLink href="/terms">Terms of Service</AuthLink>
              </nav>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
