"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SideForm = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    message: "",
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
          formSource: "Contact Us",
        }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== 200) {
        throw new Error(data.message || "Failed to send message");
      }
      if (data.status === 200) {
        toast.success(data.message);
        setForm({ name: "", email: "", mobileNumber: "", message: "" });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6 border-t pt-8 md:border-t-0 md:border-l md:pt-0 md:pl-10">
      <h2 className="text-2xl font-semibold text-gray-800">Send a Message</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
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
          placeholder="Write your message (required)..."
          aria-label="Message (required)"
          rows={5}
          onChange={handleChange}
          required
        />

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full text-base"
        >
          {loading ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </div>
  );
};

export default SideForm;
