"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ModeOfAttendanceRadio } from "./modeOfAttandanceRadio";
import axios from "axios";
import { z } from "zod";
import { toast } from "sonner";
import { RAZORPAY_KEY } from "@/env";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group";
import { SourceOfRegistraion } from "./sourceOfRegistration";
import { sourceOfRegistraion } from "@/const/workshopRegistration";
import { useRouter, useSearchParams } from "next/navigation";

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
    couponCode: z.string().optional(),
    modeOfAttandnace: z.enum(["online", "offline"]),
    registrationSource: z.enum(sourceOfRegistraion.map((it) => it.value))
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

    const searchParams = useSearchParams()


    const [form, setForm] = useState<any>({
        workshopId: workshopId,
        email: "",
        name: "",
        mobileNumber: "",
        designation: "",
        instituteName: "",
        city: "",
        couponCode: "",
        modeOfAttandnace: "online",
        registrationSource: "website",
    });
    const [couponDiscount, setCouponDiscount] = useState({
        onlineDiscount: 0,
        offlineDiscount: 0
    });

    const [loading, setLoading] = useState(false);
    const [hasJoinedWhatsapp, setHasJoinedWhatsapp] = useState(false);
    const router = useRouter()

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

    useEffect(() => {

        const utmSource = searchParams.get("utm_source");
        const utmMedium = searchParams.get("utm_medium");
        const utmCampaign = searchParams.get("utm_campaign");
        const utmContent = searchParams.get("utm_content");

        setForm((prev: any) => ({
            ...prev,
            utmSource,
            utmMedium,
            utmCampaign,
            utmContent,
        }));


    }, [searchParams]);

    const handleChange = (key: string, value: string) => {
        setForm((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleApplyCoupon = async () => {
        setLoading(true);
        try {
            const res = await axios.post("/api/workshop/validate-coupon", {
                couponCode: form.couponCode,
                workshopId: form.workshopId
            });
            const responseData = res.data;

            if (!responseData) throw new Error("Request Failed, please try again")

            if (responseData.status === 400) {
                toast.error(responseData.message);
                setCouponDiscount({
                    onlineDiscount: 0,
                    offlineDiscount: 0
                });
                return;
            }

            else if (responseData.status === 200) {
                toast.success("Coupon code applied successfully");
                setCouponDiscount({
                    onlineDiscount: responseData.data.onlineDiscount,
                    offlineDiscount: responseData.data.offlineDiscount
                });
            }

            // setForm((prev) => ({ ...prev, couponCode: responseData.couponCode }));
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

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
            // if (res.status === 200) {

            // }
            if (!responseData) throw new Error("Request Failed, please try again")

            const options = {
                key: RAZORPAY_KEY, // Replace with your Razorpay key_id
                amount: responseData.amount, // Use dynamic amount
                currency: responseData.currency,
                name: form.name,
                description: "Registration for workshop",
                order_id: responseData.id, // Use backend order_id
                handler: async function (response: any) {
                    const res = await fetch("/api/verify-payment", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(response),
                    });

                    const data = await res.json();

                    if (data.success) {
                        toast.success("Payment successful, your registration is confirmed");
                        router.push("/payment-success");
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
            rzp.on("payment.failed", function (response: any) {
                console.log("Payment Failed:", response);
                toast.error("Payment failed");
            });

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
                couponCode: "",
                modeOfAttandnace: "online",
                registrationSource: "website"
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
                <div className=" space-y-1">
                    <Label>Coupon <span className="text-gray-500">(optional)</span></Label>
                    <InputGroup>
                        <InputGroupInput value={form.couponCode} onChange={(e) => handleChange("couponCode", e.target.value)} placeholder="Enter coupon code..." />
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton onClick={handleApplyCoupon} disabled={loading} className=" cursor-pointer" variant={"default"} >Apply</InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </div>

                <ModeOfAttendanceRadio
                    priceOnline={priceOnline - couponDiscount.onlineDiscount}
                    priceOffline={priceOffline - couponDiscount.offlineDiscount}
                    value={form.modeOfAttandnace}
                    onChange={(val) =>
                        handleChange("modeOfAttandnace", val)
                    }
                />
                <SourceOfRegistraion
                    value={form.registrationSource}
                    onChange={(val) =>
                        handleChange("registrationSource", val)
                    }
                />
            </div>

            <div className="flex items-center space-x-2 py-4">
                <Checkbox
                    id="whatsappgroup"
                    checked={hasJoinedWhatsapp}
                    onCheckedChange={(checked) => setHasJoinedWhatsapp(checked as boolean)}
                />
                <label
                    htmlFor="whatsappgroup"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    I have joined the workshop WhatsApp group (link above).
                </label>
            </div>

            <Button
                className="w-full h-10"
                disabled={loading || !hasJoinedWhatsapp}
                onClick={handleSubmit}
            >
                Register & Pay
            </Button>
        </>
    );
}