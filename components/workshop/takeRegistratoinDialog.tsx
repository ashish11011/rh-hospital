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



export function WorkshopRegistrationDialog() {
    const [form, setForm] = useState({
        workshopId: "",
        email: "",
        name: "",
        mobileNumber: "",
        designation: "",
        instituteName: "",
        city: "",
        modeOfAttandnace: "online",
    });

    const handleChange = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        console.log(form);
        // call API here
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
                    <div>
                        <Label>Name</Label>
                        <Input
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                        />
                    </div>

                    <div>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={form.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                        />
                    </div>

                    <div>
                        <Label>Mobile Number</Label>
                        <Input
                            value={form.mobileNumber}
                            onChange={(e) => handleChange("mobileNumber", e.target.value)}
                        />
                    </div>

                    <div>
                        <Label>Designation</Label>
                        <Input
                            value={form.designation}
                            onChange={(e) => handleChange("designation", e.target.value)}
                        />
                    </div>

                    <div>
                        <Label>Institute Name</Label>
                        <Input
                            value={form.instituteName}
                            onChange={(e) => handleChange("instituteName", e.target.value)}
                        />
                    </div>

                    <div>
                        <Label>City</Label>
                        <Input
                            value={form.city}
                            onChange={(e) => handleChange("city", e.target.value)}
                        />
                    </div>

                    <ModeOfAttendanceRadio
                        value={form.modeOfAttandnace}
                        onChange={(val) => handleChange("modeOfAttandnace", val)}
                    />
                </div>

                <Button onClick={handleSubmit}>Submit</Button>
            </DialogContent>
        </Dialog>
    );
}