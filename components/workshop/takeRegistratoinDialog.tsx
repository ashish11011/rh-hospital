"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ModeOfAttendanceRadio } from "./modeOfAttandanceRadio";
import axios from "axios";



export function WorkshopRegistrationDialog({ workshopId, priceOnline, priceOffline }: { workshopId: string, priceOnline: number, priceOffline: number }) {
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

    const handleChange = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        console.log(form);
        try {
            const res = await axios.post("/api/workshop/register", form);
            console.log(JSON.stringify(res));
            if (res.status === 200) {
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
            }
        } catch (error) {
            console.log(error);
        }
        // call API here
        setLoading(false);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full text-lg h-10">Register Now</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Workshop Registration</DialogTitle>
                </DialogHeader>

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
                            onChange={(e) => handleChange("mobileNumber", e.target.value)}
                        />
                    </div>

                    <div className=" space-y-1">
                        <Label>Designation</Label>
                        <Input
                            value={form.designation}
                            onChange={(e) => handleChange("designation", e.target.value)}
                        />
                    </div>

                    <div className=" space-y-1">
                        <Label>Institute Name</Label>
                        <Input
                            value={form.instituteName}
                            onChange={(e) => handleChange("instituteName", e.target.value)}
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
                        onChange={(val) => handleChange("modeOfAttandnace", val)}
                    />
                </div>

                <Button disabled={loading} onClick={handleSubmit}>Submit</Button>
            </DialogContent>
        </Dialog>
    );
}