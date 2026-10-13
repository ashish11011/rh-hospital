"use client";
import { BrandLogo } from "@/components/BrandLogo";

import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import CallbackDialog from "./CallbackDialog";
import { useEffect, useState } from "react";

type AuthSessionResponse = {
  user?: {
    email?: string | null;
    name?: string | null;
  } | null;
} | null;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        const session = (await response.json()) as AuthSessionResponse;

        if (active) {
          setHasSession(Boolean(session?.user));
        }
      } catch {
        if (active) {
          setHasSession(false);
        }
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="sticky top-0 z-50 border-b bg-white">
      <header className="container">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex h-full w-auto items-center gap-2 py-1">
            <BrandLogo className="h-full" />
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => {
              return (
                <Link
                  prefetch={false}
                  key={link.title}
                  href={link.href}
                  className="text-sm"
                >
                  {link.title}
                </Link>
              );
            })}

            <div className="flex items-center gap-2">
              {hasSession ? (
                <Button className="" asChild>
                  <Link prefetch={false} href="/dashboard">
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant={"link"} className="" asChild>
                    <Link prefetch={false} href="/sign-in">
                      Sign in
                    </Link>
                  </Button>
                  <Button className="" asChild>
                    <Link prefetch={false} href="/sign-up">
                      Sign up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-72 px-4">
                <div className="mt-6 flex flex-col gap-4">
                  {NAV_LINKS.map((link) => {
                    return (
                      <Link
                        prefetch={false}
                        key={link.title}
                        href={link.href}
                        className="text-sm"
                      >
                        {link.title}
                      </Link>
                    );
                  })}

                  <div className="mt-4 flex flex-col gap-2 pr-4">
                    {hasSession ? (
                      <Button className="" asChild>
                        <Link prefetch={false} href="/dashboard">
                          Dashboard
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button variant={"outline"} asChild>
                          <Link prefetch={false} href="/sign-in">
                            Sign in
                          </Link>
                        </Button>
                        <Button asChild>
                          <Link prefetch={false} href="/sign-up">
                            Sign up
                          </Link>
                        </Button>
                      </>
                    )}
                    <Button onClick={() => setOpen(true)}>Contact Us</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <CallbackDialog open={open} setOpen={setOpen} />
    </div>
  );
}

const NAV_LINKS = [
  { title: "RH Healthcare", href: "/" },
  { title: "Courses", href: "/courses" },
  { title: "Workshops", href: "/workshops" },
  {
    title: "Conference",
    href: "/rh-healthcare-ntai-conference-ric-jaipur-2026",
  },
  // { title: "International Patients", href: "/international-patients" },
  // { title: "Login", href: "/" },
];
