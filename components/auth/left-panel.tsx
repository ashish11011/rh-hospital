import Image from "next/image";

export default function LeftPanel() {
    return (
        <section className="relative hidden lg:block">

            <Image
                src="/images/auth.jpg"
                fill
                priority
                alt="Healthcare"
                className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-blue-900/40 to-blue-950/90" />

            <div className="absolute bottom-16 left-14 max-w-md text-white">

                <h1 className="text-6xl font-bold leading-tight">
                    Elevating
                    <br />
                    Healthcare
                    <br />
                    Standards.
                </h1>

                <p className="mt-8 text-lg text-blue-100 leading-8">
                    Join the world's trusted network for medical education
                    and clinical certification powered by excellence.
                </p>

                <div className="mt-12 flex items-center gap-4">

                    <div className="flex -space-x-4">
                        <Image
                            src="/avatars/1.jpg"
                            width={50}
                            height={50}
                            alt=""
                            className="rounded-full border-4 border-white"
                        />

                        <Image
                            src="/avatars/2.jpg"
                            width={50}
                            height={50}
                            alt=""
                            className="rounded-full border-4 border-white"
                        />
                    </div>

                    <span className="font-semibold">
                        Trusted by 10K+ Specialists
                    </span>

                </div>

            </div>

        </section>
    );
}