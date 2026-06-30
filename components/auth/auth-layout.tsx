import LeftPanel from "./left-panel";


interface Props {
    children: React.ReactNode;
    title: string;
    description: string;
}

export default function AuthLayout({
    children,
    title,
    description,
}: Props) {
    return (
        <main className="min-h-screen bg-slate-100 p-5">
            <div className="mx-auto grid min-h-[95vh] max-w-7xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
                <LeftPanel />

                <section className="flex items-center justify-center p-8 lg:p-16">
                    <div className="w-full max-w-md">

                        <div className="mb-10 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                                +
                            </div>

                            <h2 className="text-3xl font-bold text-blue-700">
                                RH Healthcare
                            </h2>
                        </div>

                        <div className="rounded-3xl border bg-white p-8 shadow-lg">
                            <h1 className="text-4xl font-bold">{title}</h1>

                            <p className="mt-2 text-muted-foreground">
                                {description}
                            </p>

                            <div className="mt-8">
                                {children}
                            </div>
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