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
    <div className="bg-gradient-to-b from-gray-50 to-white px-6 py-20 md:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-gray-500">
            We'd love to hear from you. Send us a message or reach out directly.
          </p>
        </div>

        {/* Single Container */}
        <Card className="rounded-2xl border-0 shadow-xl">
          <CardContent className="grid gap-10 p-8 md:grid-cols-2">
            {/* Right - Details */}
            <div className="flex flex-col justify-center gap-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Contact Info
              </h2>

              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gray-100 p-3">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a
                    className="font-medium text-blue-800"
                    href="mailto:rhhealthcaresimulationcenter@gmail.com"
                  >
                    rhhealthcaresimulationcenter@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gray-100 p-3">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">+91 99289 07780</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gray-100 p-3">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">
                    18-Shakti nagar, Gopalpura bypass road, near Triveni nagar
                    chouraha, Jaipur (Raj) -302015
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gray-100 p-3">
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
