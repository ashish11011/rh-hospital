"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Phone, Mail } from "lucide-react";
import Link from "next/link";

export default function CallbackDialog({ open, setOpen }: any) {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
    });

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        console.log(form);
    };
    useEffect(() => {
        console.log(open)
    }, [open])
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md rounded-xl p-0 overflow-hidden">

                <div className="p-6 space-y-5">
                    {/* Header */}
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-center">
                            Need help finding what you were looking for?
                        </DialogTitle>
                        <p className="text-sm text-gray-500 text-center">
                            Get a call back from our Health advisor
                        </p>
                    </DialogHeader>

                    {/* Form */}
                    <div className="space-y-4">
                        <Input
                            name="name"
                            placeholder="Name*"
                            onChange={handleChange}
                            className="h-11"
                        />
                        <Input
                            name="phone"
                            placeholder="Phone*"
                            onChange={handleChange}
                            className="h-11"
                        />
                        <Input
                            name="email"
                            placeholder="Email"
                            onChange={handleChange}
                            className="h-11"
                        />
                    </div>

                    {/* Button */}
                    <Button
                        onClick={handleSubmit}
                        className="w-full h-11"
                    >
                        Request a Callback
                    </Button>

                    {/* Terms */}
                    <p className="text-xs text-center text-gray-500">
                        By clicking you agree to our{" "}
                        <Button variant={"link"} className=" p-0 text-sm" onClick={() => setOpen(false)}>
                            <Link href={"/privacy-policy"} className="text-blue-800 font-medium cursor-pointer">
                                Privacy policy
                            </Link>
                        </Button>
                        ,{" "}
                        <Button variant={"link"} className=" p-0 text-sm" onClick={() => setOpen(false)}>
                            <Link href={"/terms"} className="text-blue-800 font-medium cursor-pointer">
                                Terms of Use
                            </Link>
                        </Button>{" "}
                        & Disclaimer
                    </p>

                    {/* Contact */}
                    <div className="flex flex-col gap-2 text-sm text-gray-700 pt-2">
                        <div className="flex items-center gap-2">
                            <Phone size={16} />
                            <span>+91 99289 07780</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail size={16} />
                            <a className=" text-blue-800 font-medium" href="mailto:connect.rhhealth@gmail.com">connect.rhhealth@gmail.com</a>
                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}