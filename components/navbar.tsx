"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

import Image from "next/image";

export function Navbar() {
    return (
        <div className="border-b bg-white sticky top-0 z-50">
            <header className="container ">
                <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-4">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 h-full w-auto py-1 ">
                        <Image src={"/logo.png"} height={100} width={250} className=" h-full w-auto" alt="logo" />
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center gap-6">

                        <p> Rh healthcare</p>

                        <Link href="/workshops" className="text-sm">Workshops</Link>

                        <p>Specialities</p>

                        <Link href="#" className="text-sm">
                            International Patients
                        </Link>

                        <Link href="#" className="text-sm">
                            Login
                        </Link>


                        <Button className="">
                            Book Appointment
                        </Button>
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

                                    <Link href="#">Rh healthcare</Link>
                                    <Link href="/workshops" className="text-sm">Workshops</Link>
                                    <Link href="#">Specialities</Link>
                                    <Link href="#">International Patients</Link>
                                    <Link href="#">Login</Link>

                                    <Button className="mt-4">
                                        Book Appointment
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                </div>
            </header >
        </div>
    );
}