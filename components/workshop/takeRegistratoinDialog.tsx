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
import { WORKSHOP_REGISTRATION_MODES, getWorkshopAttendanceModes, isWorkshopRegistrationAllowed, type WorkshopAttendanceMode } from "@/lib/workshopAttendance";
import { MemberWorkshopVerification, type WorkshopMemberDetails } from "./MemberWorkshopVerification";
import { getWorkshopPricing } from "@/lib/workshopPricing";

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
    modeOfAttandnace: z.enum(WORKSHOP_REGISTRATION_MODES),
    registrationSource: z.enum(sourceOfRegistraion.map((it) => it.value))
});

export function WorkshopRegistration({
    workshopId,
    priceOnline,
    priceOffline,
    attendanceMode = "both",
    whatsappLink,
}: {
    workshopId: string;
    priceOnline: number;
    priceOffline: number;
    attendanceMode?: WorkshopAttendanceMode;
    whatsappLink?: string | null;
}) {

    const searchParams = useSearchParams()
    const availableModes = getWorkshopAttendanceModes(attendanceMode);


    const [form, setForm] = useState<any>({
        workshopId: workshopId,
        email: "",
        name: "",
        mobileNumber: "",
        designation: "",
        instituteName: "",
        city: "",
        couponCode: "",
        modeOfAttandnace: availableModes[0],
        registrationSource: "website",
    });
    const selectedMode = isWorkshopRegistrationAllowed(attendanceMode, form.modeOfAttandnace)
        ? form.modeOfAttandnace
        : availableModes[0];
    const [couponDiscount, setCouponDiscount] = useState({
        onlineDiscount: 0,
        offlineDiscount: 0
    });

    const [loading, setLoading] = useState(false);
    const [hasJoinedWhatsapp, setHasJoinedWhatsapp] = useState(false);
    const [registrationType, setRegistrationType] = useState<"regular" | "member">("regular");
    const [memberDetails, setMemberDetails] = useState<WorkshopMemberDetails | null>(null);
    const [verifiedUntil, setVerifiedUntil] = useState(0);

    useEffect(() => {
        if (!verifiedUntil) return;
        const timeout = setTimeout(() => {
            setMemberDetails(null);
            setVerifiedUntil(0);
            toast.error("Your membership verification has expired. Please verify again.");
        }, Math.max(0, verifiedUntil - Date.now()));
        return () => clearTimeout(timeout);
    }, [verifiedUntil]);

    function changeRegistrationType(type: "regular" | "member") {
        setRegistrationType(type);
        setMemberDetails(null);
        setVerifiedUntil(0);
        setCouponDiscount({ onlineDiscount: 0, offlineDiscount: 0 });
        setHasJoinedWhatsapp(false);
        setForm((prev: any) => ({ ...prev, email: "", name: "", mobileNumber: "", designation: "", instituteName: "", city: "", couponCode: "" }));
    }

    const memberVerified = registrationType === "member" && Boolean(memberDetails);
    const onlinePricing = getWorkshopPricing(priceOnline, memberVerified, couponDiscount.onlineDiscount);
    const offlinePricing = getWorkshopPricing(priceOffline, memberVerified, couponDiscount.offlineDiscount);

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

        if (registrationType === "member" && (!memberDetails || verifiedUntil <= Date.now())) {
            toast.error("Please verify your RH Membership Card first.");
            setLoading(false);
            return;
        }
        const registration = { ...form, registrationType, modeOfAttandnace: selectedMode };
        const result = schema.safeParse(registration);

        if (!result.success) {
            toast.error("Please fill all the fields")
            console.log(result.error.flatten().fieldErrors);
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post("/api/workshop/register", registration);
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
            toast.error(axios.isAxiosError(error)
                ? error.response?.data?.message || "Unable to start payment. Please try again."
                : error instanceof Error ? error.message : "Unable to start payment. Please try again.");
            setLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-4 border-t pt-4">
                <Label>Register for this workshop</Label>
                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant={registrationType === "regular" ? "default" : "outline"} disabled={loading} onClick={() => changeRegistrationType("regular")}>Regular registration</Button>
                    <Button type="button" variant={registrationType === "member" ? "default" : "outline"} disabled={loading} onClick={() => changeRegistrationType("member")}>RH member · 20% off</Button>
                </div>
                {registrationType === "member" && !memberDetails && <MemberWorkshopVerification workshopId={workshopId} onVerified={(details, expiresIn) => {
                    setMemberDetails(details);
                    setVerifiedUntil(Date.now() + expiresIn * 1000);
                    setForm((prev: any) => ({ ...prev, ...details, couponCode: "" }));
                }} />}
                {memberVerified && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Membership verified. Your card details are filled below. You get 20% off the listed workshop fee; coupons cannot be combined.</p>}
            </div>
            {(registrationType === "regular" || memberVerified) && <>
            <div className="grid gap-4 py-4">
                <div className=" space-y-1">
                    <Label>Name</Label>
                    <Input
                        value={form.name}
                        readOnly={memberVerified}
                        onChange={(e) => handleChange("name", e.target.value)}
                    />
                </div>

                <div className=" space-y-1">
                    <Label>Email</Label>
                    <Input
                        type="email"
                        value={form.email}
                        readOnly={memberVerified}
                        onChange={(e) => handleChange("email", e.target.value)}
                    />
                </div>

                <div className=" space-y-1">
                    <Label>Mobile Number</Label>
                    <Input
                        value={form.mobileNumber}
                        readOnly={memberVerified}
                        onChange={(e) =>
                            handleChange("mobileNumber", e.target.value)
                        }
                    />
                </div>

                <div className=" space-y-1">
                    <Label>Designation</Label>
                    <Input
                        value={form.designation}
                        readOnly={memberVerified}
                        onChange={(e) =>
                            handleChange("designation", e.target.value)
                        }
                    />
                </div>

                <div className=" space-y-1">
                    <Label>Institute Name</Label>
                    <Input
                        value={form.instituteName}
                        readOnly={memberVerified && Boolean(memberDetails?.instituteName)}
                        onChange={(e) =>
                            handleChange("instituteName", e.target.value)
                        }
                    />
                </div>

                <div className=" space-y-1">
                    <Label>City</Label>
                    <Input
                        value={form.city}
                        readOnly={memberVerified}
                        onChange={(e) => handleChange("city", e.target.value)}
                    />
                </div>
                {!memberVerified && <div className=" space-y-1">
                    <Label>Coupon <span className="text-gray-500">(optional)</span></Label>
                    <InputGroup>
                        <InputGroupInput value={form.couponCode} onChange={(e) => { handleChange("couponCode", e.target.value); setCouponDiscount({ onlineDiscount: 0, offlineDiscount: 0 }); }} placeholder="Enter coupon code..." />
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton onClick={handleApplyCoupon} disabled={loading} className=" cursor-pointer" variant={"default"} >Apply</InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </div>}

                <CustomRadioGroup
                    label="Mode of Attendance"
                    value={selectedMode}
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
                                        {memberVerified && <s className="mr-2 text-gray-500">Rs. {priceOnline}</s>}
                                        Rs. {onlinePricing.amount}
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
                                        {memberVerified && <s className="mr-2 text-gray-500">Rs. {priceOffline}</s>}
                                        Rs. {offlinePricing.amount}
                                    </span>
                                </>
                            ),
                        },
                    ].filter((option) => isWorkshopRegistrationAllowed(attendanceMode, option.value))}
                />
                <SourceOfRegistraion
                    value={form.registrationSource}
                    onChange={(val) =>
                        handleChange("registrationSource", val)
                    }
                />
            </div>

            {whatsappLink && <a href={whatsappLink} target="_blank" rel="noreferrer" className="text-sm text-green-700 underline">Join the workshop WhatsApp group</a>}
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
            </>}
        </>
    );
}
