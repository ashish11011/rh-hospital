"use client"
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

const SideForm = () => {
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: "",
        email: "",
        mobileNumber: "",
        message: "",
    });

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/contact-form", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.status === 200) {
                toast.success(data.message)
                setForm({ name: "", email: "", mobileNumber: "", message: "" });
            }
        } catch (error) {
            toast.error("Something went wrong")
            console.log(error)
        } finally {
            setLoading(false)
        }
    };
    return (
        <div className="space-y-6 border-t md:border-t-0 md:border-l md:pl-10 pt-8 md:pt-0">
            <h2 className="text-2xl font-semibold text-gray-800">
                Send a Message
            </h2>

            <div className="space-y-5">
                <Input
                    name="name"
                    value={form.name}
                    placeholder="Full Name"
                    onChange={handleChange}
                    required
                    className="h-11"
                />

                <Input
                    type="email"
                    name="email"
                    value={form.email}
                    placeholder="Email Address"
                    onChange={handleChange}
                    required
                    className="h-11"
                />

                <Input
                    type="tel"
                    name="mobileNumber"
                    value={form.mobileNumber}
                    placeholder="Mobile Number"
                    onChange={handleChange}
                    required
                    className="h-11"
                />

                <Textarea
                    name="message"
                    value={form.message}
                    placeholder="Write your message..."
                    rows={5}
                    onChange={handleChange}
                    required
                />

                <Button onClick={handleSubmit} disabled={loading} className="w-full h-11 text-base">
                    {loading ? "Sending..." : "Send Message"}
                </Button>
            </div>
        </div>
    )
}

export default SideForm