"use client"
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export default function ContactUs() {
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: "",
        email: "",
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
                setForm({ name: "", email: "", message: "" });
            }
        } catch (error) {
            toast.error("Something went wrong")
            console.log(error)
        } finally {
            setLoading(false)
        }
    };

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white   py-20 px-6 md:px-16">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Contact Us
                    </h1>
                    <p className="text-gray-500">
                        We'd love to hear from you. Send us a message or reach out directly.
                    </p>
                </div>

                {/* Single Container */}
                <Card className="rounded-2xl shadow-xl border-0">
                    <CardContent className="p-8 grid md:grid-cols-2 gap-10">


                        {/* Right - Details */}
                        <div className="flex flex-col justify-center gap-6 ">

                            <h2 className="text-2xl font-semibold text-gray-800">
                                Contact Info
                            </h2>

                            <div className="flex items-center gap-4">
                                <div className="bg-gray-100 p-3 rounded-xl">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <a className=" text-blue-800 font-medium" href="mailto:connect.rhhealth@gmail.com">connect.rhhealth@gmail.com</a>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-gray-100 p-3 rounded-xl">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium text-gray-900">
                                        +91 99289 07780
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-gray-100 p-3 rounded-xl">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p className="font-medium text-gray-900">
                                        18-Shakti nagar, Gopalpura bypass road, near Triveni nagar chouraha, Jaipur (Raj) -302015
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-gray-100 p-3 rounded-xl">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Working Hours</p>
                                    <p className="font-medium text-gray-900">
                                        Mon - Fri: 9:00 AM - 6:00 PM
                                    </p>
                                </div>
                            </div>

                        </div>

                        {/* Left - Form */}
                        <div className="space-y-6 border-t md:border-t-0 md:border-l md:pl-10 pt-8 md:pt-0">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Send a Message
                            </h2>

                            <div className="space-y-5">
                                <Input
                                    name="name"
                                    placeholder="Full Name"
                                    onChange={handleChange}
                                    required
                                    className="h-11"
                                />

                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    onChange={handleChange}
                                    required
                                    className="h-11"
                                />

                                <Textarea
                                    name="message"
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}