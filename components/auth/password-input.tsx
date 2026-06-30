"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface PasswordInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

export default function PasswordInput({
    ...props
}: PasswordInputProps) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
                {...props}
                type={show ? "text" : "password"}
                className="h-12 rounded-xl pl-10 pr-12"
            />

            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
            >
                {show ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                )}
            </button>
        </div>
    );
}