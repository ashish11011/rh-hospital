"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomRadioGroup } from "@/components/custom-radio-group";
import axios from "axios";
import { z } from "zod";
import { toast } from "sonner";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group";
import { SourceOfRegistraion } from "./sourceOfRegistration";
import { sourceOfRegistraion } from "@/const/workshopRegistration";
import { useSearchParams } from "next/navigation";

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
               // toast.success("Coupon code no longer available");
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
            if (!responseData.paymentUrl) throw new Error("Payment link was not generated. Please try again.");

            window.sessionStorage.setItem(
                "hdfcPaymentOrder",
                JSON.stringify({ orderId: responseData.orderId, type: "workshop" })
            );
            window.location.assign(responseData.paymentUrl);

        } catch (error) {
            console.log(error);
            toast.error(error instanceof Error ? error.message : "Unable to start payment. Please try again.");
            setLoading(false);
        }
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

                <CustomRadioGroup
                    label="Mode of Attendace"
                    value={form.modeOfAttandnace}
                    onChange={(val) => handleChange("modeOfAttandnace", val)}
                    options={[
                        {
                            id: "online-mode",
                            value: "online",
                            title: "Online",
                            description: (
                                <>
                                    Attend remotely via internet.
                                    <br />
                                    <span className="text-gray-800">
                                        Rs. {priceOnline - couponDiscount.onlineDiscount}
                                    </span>
                                </>
                            ),
                        },
                        {
                            id: "offline-mode",
                            value: "offline",
                            title: "Offline",
                            description: (
                                <>
                                    Attend physically at location.
                                    <br />
                                    <span className="text-gray-800">
                                        Rs. {priceOffline - couponDiscount.offlineDiscount}
                                    </span>
                                </>
                            ),
                        },
                    ]}
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
