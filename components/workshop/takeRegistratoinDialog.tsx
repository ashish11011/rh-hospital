"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ModeOfAttendanceRadio } from "./modeOfAttandanceRadio";
import axios from "axios";
import { z } from "zod";
import { toast } from "sonner";

const schema = z.object({
    workshopId: z.string(),
    email: z.string().email("Invalid email"),
    name: z.string().min(1, "Name is required"),
    mobileNumber: z
        .string()
        .min(10, "Enter valid number")
        .max(15, "Too long"),
    designation: z.string().min(1, "Required"),
    instituteName: z.string().min(1, "Required"),
    city: z.string().min(1, "Required"),
    modeOfAttandnace: z.enum(["online", "offline"]),
});

export function WorkshopRegistration({
    workshopId,
    priceOnline,
    priceOffline,
}: {
    workshopId: string;
    priceOnline: number;
    priceOffline: number;
}) {
    const [form, setForm] = useState({
        workshopId: workshopId,
        email: "",
        name: "",
        mobileNumber: "",
        designation: "",
        instituteName: "",
        city: "",
        modeOfAttandnace: "online",
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadScript = () => {
            return new Promise((resolve) => {
                const script = document.createElement("script");
                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                script.onload = () => {
                    resolve(true);
                };
                script.onerror = () => {
                    resolve(false);
                };
                document.body.appendChild(script);
            });
        };

        loadScript();
    }, []);

    const handleChange = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);

        const result = schema.safeParse(form);

        if (!result.success) {
            toast.error("Please fill all the fields")
            console.log(result.error.flatten().fieldErrors);
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post("/api/workshop/register", form);
            const responseData = res.data.data;
            console.log(JSON.stringify(res));
            // if (res.status === 200) {

            // }

            const options = {
                key: "rzp_test_SdJzsB1BH8Arbm", // Replace with your Razorpay key_id
                amount: responseData.amount, // Use dynamic amount
                currency: responseData.currency,
                name: form.name,
                description: "Registration for workshop",
                order_id: responseData.id, // Use backend order_id
                handler: async function (response: any) {
                    console.log("Client res-> ", response)
                    const res = await fetch("/api/verify-payment", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(response),
                    });

                    const data = await res.json();

                    if (data.status == 200) {
                        toast.success("Payment successful, your registration is confirmed")
                    } else if (data.status == 400) {
                        toast.error("Payment failed")
                    }
                },
                prefill: {
                    name: form.name,
                    email: form.email,
                    contact: form.mobileNumber,
                },
                theme: {
                    color: "#2e7d32",
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();


            // clear the form after successfull payment
            setForm({
                workshopId: workshopId,
                email: "",
                name: "",
                mobileNumber: "",
                designation: "",
                instituteName: "",
                city: "",
                modeOfAttandnace: "online",
            });

        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    return (
        <>
            <div className="grid gap-4 py-4">
                <div className=" space-y-1">
                    <Label>Name</Label>
                    <Input
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                    />
                </div>

                <div className=" space-y-1">
                    <Label>Email</Label>
                    <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                    />
                </div>

                <div className=" space-y-1">
                    <Label>Mobile Number</Label>
                    <Input
                        value={form.mobileNumber}
                        onChange={(e) =>
                            handleChange("mobileNumber", e.target.value)
                        }
                    />
                </div>

                <div className=" space-y-1">
                    <Label>Designation</Label>
                    <Input
                        value={form.designation}
                        onChange={(e) =>
                            handleChange("designation", e.target.value)
                        }
                    />
                </div>

                <div className=" space-y-1">
                    <Label>Institute Name</Label>
                    <Input
                        value={form.instituteName}
                        onChange={(e) =>
                            handleChange("instituteName", e.target.value)
                        }
                    />
                </div>

                <div className=" space-y-1">
                    <Label>City</Label>
                    <Input
                        value={form.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                    />
                </div>

                <ModeOfAttendanceRadio
                    priceOnline={priceOnline}
                    priceOffline={priceOffline}
                    value={form.modeOfAttandnace}
                    onChange={(val) =>
                        handleChange("modeOfAttandnace", val)
                    }
                />
            </div>

            <Button
                className="w-full h-10"
                disabled={loading}
                onClick={handleSubmit}
            >
                Submit
            </Button>
        </>
    );
}