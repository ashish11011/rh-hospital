"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function CourseWaitlistDialog({
  courseTitle,
  amount,
}: {
  courseTitle: string;
  amount: string | number;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      mobileNumber: formData.get("mobileNumber"),
      message: formData.get("message"),
      formSource: `Course Waitlist - ${courseTitle}`,
    };

    try {
      const res = await fetch("/api/contact-form", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        toast.success("Interest submitted successfully!");
        setOpen(false);
      } else {
        toast.error("Failed to submit interest. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full text-lg" size={"lg"}>
          Express Interest
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Coming Soon</DialogTitle>
          <DialogDescription>
            This course will be live soon! Fill out your details to express your interest and we will notify you once it is available.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              name="name"
              placeholder="Your Name"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Input
              name="email"
              type="email"
              placeholder="Your Email"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Input
              name="mobileNumber"
              type="tel"
              placeholder="Your Mobile Number"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              name="message"
              placeholder="Any comments or questions? (Optional)"
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
