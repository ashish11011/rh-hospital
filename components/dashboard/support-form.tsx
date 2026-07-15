"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type SupportFormUser = {
  name: string;
  email: string;
  mobileNumber: string;
};

export function SupportForm({ user }: { user: SupportFormUser }) {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const subject = formData.subject.trim();
      const message = formData.message.trim();

      const response = await fetch("/api/contact-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          mobileNumber: user.mobileNumber,
          formSource: `support - ${subject}`,
          message,
        }),
      });
      const data = await response.json();

      if (!response.ok || data.status !== 200) {
        throw new Error(data.message || "Failed to submit support ticket");
      }

      toast.success("Ticket raised successfully! Support will contact you soon.");
      setFormData({ subject: "", message: "" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit support ticket",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Subject</Label>
        <Input
          name="subject"
          placeholder="e.g. Issue with my certificate"
          value={formData.subject}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Describe your issue</Label>
        <Textarea
          name="message"
          placeholder="Please provide details about the problem you're facing..."
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Ticket
      </Button>
    </form>
  );
}
