"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";

export function CertificateDialogButton() {

  const TitleDescirption = ({ title, descirption }: { title: string, descirption: string }) => {
    return (
      <div className=" space-y-2">
        <h4 className=" font-semibold">{title}</h4>
        <p className=" pl-6 text-gray-700">{descirption}</p>
      </div>
    )
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"lg"} className="">
          <p>Why This Certificate Matters</p>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Certificate Benefits</DialogTitle>
          <DialogDescription>
            Earning this certificate provides verified proof of your clinical competencies.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ul className="list-disc pl-5 space-y-6 text-sm text-gray-700">
            <TitleDescirption title="🎓 Professionally Designed Certificate" descirption="Receive a digital certificate upon successful completion." />
            <TitleDescirption title="📚 Credit Hours" descirption="Eligible workshops include CME/CNE/RNC credit hours (where applicable)." />
            <TitleDescirption title="💼 Career Value" descirption="Demonstrates your commitment to continuous learning and professional development." />
            <TitleDescirption title="📥 Instant Digital Download" descirption="Access your certificate anytime from your account after completion." />
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
