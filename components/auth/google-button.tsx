"use client";

import { Button } from "@/components/ui/button";

export default function GoogleButton() {
    return (
        <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-xl"
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
            >
                <path
                    fill="#FFC107"
                    d="M43.6 20H42V20H24V28H35.3C33.6 32.7 29.2 36 24 36C17.4 36 12 30.6 12 24S17.4 12 24 12C27 12 29.7 13.1 31.8 15L37.5 9.3C34 6.1 29.3 4 24 4C13 4 4 13 4 24S13 44 24 44S44 35 44 24C44 22.7 43.9 21.3 43.6 20Z"
                />
                <path
                    fill="#FF3D00"
                    d="M6.3 14.7L12.9 19.5C14.7 15.1 19 12 24 12C27 12 29.7 13.1 31.8 15L37.5 9.3C34 6.1 29.3 4 24 4C16.3 4 9.7 8.3 6.3 14.7Z"
                />
                <path
                    fill="#4CAF50"
                    d="M24 44C29.2 44 33.8 42 37.3 38L31 32.7C29 34.2 26.6 35.1 24 35.1C18.8 35.1 14.5 31.8 12.8 27.2L6.2 32.2C9.5 39 16.2 44 24 44Z"
                />
                <path
                    fill="#1976D2"
                    d="M43.6 20H42V20H24V28H35.3C34.5 30.3 33.1 32.3 31 33.8L37.3 39C36.8 39.4 44 34 44 24C44 22.7 43.9 21.3 43.6 20Z"
                />
            </svg>

            Continue with Google
        </Button>
    );
}