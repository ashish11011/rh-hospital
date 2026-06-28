"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

import Image from "next/image";
import CallbackDialog from "./CallbackDialog";
import { useState } from "react";

export function Navbar() {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b bg-white sticky top-0 z-50">
            <header className="container ">
                <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-4">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 h-full w-auto py-1 ">
                        <Image src={"/logo.png"} loading="eager" height={100} width={250} className=" h-full w-auto" alt="logo" />
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center gap-6">

                        {NAV_LINKS.map((link) => {
                            return (
                                <Link key={link.title} href={link.href} className="text-sm">{link.title}</Link>
                            )
                        })}

                        <div className=" flex gap-2 items-center">
                            <Button variant={"link"} className="">
                                Sign in
                            </Button>
                            <Button className="">
                                Sign up
                            </Button>
                        </div>
                    </nav>

                    {/* Mobile Menu */}
                    <div className="md:hidden flex items-center gap-2">

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu />
                                </Button>
                            </SheetTrigger>

                            <SheetContent side="right" className="w-72 px-4">
                                <div className="flex flex-col gap-4 mt-6">

                                    {NAV_LINKS.map((link) => {
                                        return (
                                            <Link key={link.title} href={link.href} className="text-sm">{link.title}</Link>
                                        )
                                    })}

                                    <Button onClick={() => setOpen(true)} className="mt-4 rounded-sm">
                                        Contact Us
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                </div>
            </header >
            <CallbackDialog open={open} setOpen={setOpen} />
        </div>
    );
}

const NAV_LINKS = [
    { title: "Courses", href: "/courses" },
    { title: "Workshops", href: "/workshops" },
    { title: "Conference", href: "/rh-healthcare-ntai-conference-ric-jaipur-2026" },
    // { title: "International Patients", href: "/international-patients" },
    // { title: "Login", href: "/" },
]