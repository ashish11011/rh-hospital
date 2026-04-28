
import { Card, CardContent } from "@/components/ui/card";

import { Mail, Phone, MapPin, Clock } from "lucide-react";
import SideForm from "./SideForm";

export const metadata = {
    title: "Contact Us",
    description:
        "Get in touch with RH Healthcare Pvt. Ltd. for inquiries about medical simulators, healthcare products, and workshops.",
    alternates: {
        canonical: "https://www.rhhealthcaresimulation.com/contact-us",
    },
};

export default function ContactUs() {


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
                        <SideForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}