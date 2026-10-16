"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Phone, Mail } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CallbackDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    mobileNumber: "",
    message: "",
    email: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    if (!form.message.trim()) {
      toast.error("Please enter your message.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          message: form.message.trim(),
          formSource: "Homepage callback",
        }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== 200) {
        throw new Error(data.message || "Failed to send message");
      }
      if (data.status === 200) {
        setForm({ name: "", mobileNumber: "", email: "", message: "" });
        toast.success(data.message);
        setOpen(false);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-xl p-0 sm:max-w-md">
        <div className="space-y-5 p-6">
          {/* Header */}
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold">
              Need help finding what you were looking for?
            </DialogTitle>
            <p className="text-center text-sm text-gray-500">
              Get a call back from our Health advisor
            </p>
          </DialogHeader>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              value={form.name}
              required
              placeholder="Name*"
              onChange={handleChange}
              className="h-11"
            />
            <Input
              name="mobileNumber"
              type="tel"
              value={form.mobileNumber}
              required
              placeholder="Phone*"
              onChange={handleChange}
              className="h-11"
            />
            <Input
              name="email"
              type="email"
              value={form.email}
              placeholder="Email"
              onChange={handleChange}
              className="h-11"
            />
            <Textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="How can we help? (required)"
              aria-label="Message (required)"
              rows={4}
              required
            />

            {/* Button */}
            <Button disabled={loading} type="submit" className="h-11 w-full">
              {loading ? "Sending..." : "Request a Callback"}
            </Button>
          </form>

          {/* Terms */}
          <p className="text-center text-xs text-gray-500">
            By clicking you agree to our{" "}
            <Button
              variant={"link"}
              className="p-0 text-sm"
              onClick={() => setOpen(false)}
            >
              <Link
                href={"/privacy-policy"}
                className="cursor-pointer font-medium text-blue-800"
              >
                Privacy policy
              </Link>
            </Button>
            ,{" "}
            <Button
              variant={"link"}
              className="p-0 text-sm"
              onClick={() => setOpen(false)}
            >
              <Link
                href={"/terms"}
                className="cursor-pointer font-medium text-blue-800"
              >
                Terms of Use
              </Link>
            </Button>{" "}
            & Disclaimer
          </p>

          {/* Contact */}
          <div className="flex flex-col gap-2 pt-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Phone size={16} />
              <span>+91 99289 07780</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} />
              <a
                className="font-medium text-blue-800"
                href="mailto:rhhealthcaresimulationcenter@gmail.com"
              >
                rhhealthcaresimulationcenter@gmail.com
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
