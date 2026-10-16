"use client";

import { useState } from "react";
import { ArrowRight, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const SidebarForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    if (!formData.name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!formData.message.trim()) {
      toast.error("Please enter your message.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/contact-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          mobileNumber: formData.mobileNumber.trim(),
          message: formData.message.trim(),
          formSource: "About Us",
        }),
      });
      const data = await response.json();
      if (!response.ok || data.status !== 200) {
        throw new Error(data.message || "Failed to send message");
      }
      toast.success(data.message);
      setFormData({ name: "", email: "", mobileNumber: "", message: "" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside
      aria-labelledby="enquiry-heading"
      className="min-w-0 rounded-2xl border border-slate-100 bg-white shadow-sm lg:sticky lg:top-24"
    >
      <div className="rounded-t-2xl border-b border-green-100 bg-green-50/60 p-6">
        <span className="bg-primary/10 text-primary mb-4 flex size-11 items-center justify-center rounded-xl">
          <MessageSquare className="size-5" aria-hidden="true" />
        </span>
        <h2
          id="enquiry-heading"
          className="text-xl font-semibold tracking-tight text-slate-900"
        >
          Let’s connect
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Tell us about your training or equipment requirements.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="space-y-2">
          <Label htmlFor="about-name" className="text-sm text-slate-700">
            Name
          </Label>
          <Input
            id="about-name"
            type="text"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter your name"
            className="h-11 rounded-lg bg-slate-50/50 shadow-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="about-mobile" className="text-sm text-slate-700">
            Mobile
          </Label>
          <Input
            id="about-mobile"
            type="tel"
            name="mobileNumber"
            autoComplete="tel"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
            placeholder="Enter mobile number"
            className="h-11 rounded-lg bg-slate-50/50 shadow-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="about-email" className="text-sm text-slate-700">
            Email ID
          </Label>
          <Input
            id="about-email"
            type="email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter email address"
            className="h-11 rounded-lg bg-slate-50/50 shadow-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="about-message" className="text-sm text-slate-700">
            Message
          </Label>
          <Textarea
            id="about-message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="How can we help you?"
            rows={4}
            className="min-h-28 resize-y rounded-lg bg-slate-50/50 shadow-none"
          />
        </div>
        <Button type="submit" disabled={loading} className="h-11 w-full">
          {loading ? "Sending..." : "Submit enquiry"}
          <ArrowRight aria-hidden="true" />
        </Button>
      </form>
    </aside>
  );
};

export default SidebarForm;
