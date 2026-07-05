import LeftPanel from "./left-panel";
import Image from "next/image";

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
              <Image
                src={"/logo.png"}
                loading="eager"
                height={100}
                width={250}
                className="h-12 w-auto"
                alt="logo"
              />
            </div>

            <div className="rounded-3xl border bg-white p-8 shadow-lg">
              <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>

              <p className="text-muted-foreground mt-2">{description}</p>

              <div className="mt-8">{children}</div>
            </div>

            <div className="mt-10 flex justify-between text-sm text-gray-500">
              <span>© 2026 RH Healthcare</span>

              <div className="flex gap-5">
                <button>Support</button>
                <button>Privacy</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
