"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { updateUserProfile } from "@/lib/actions/profile";
import { toast } from "sonner";

export function ProfileForm({
  initialData,
  email,
}: {
  initialData: any;
  email: string;
}) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    mobileNumber: initialData?.mobileNumber || "",
    designation: initialData?.designation || "",
    instituteName: initialData?.instituteName || "",
    city: initialData?.city || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await updateUserProfile(email, formData);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Profile updated successfully!");
      router.refresh();
    }

    setIsSubmitting(false);
  };

  return (
    <form className="max-w-2xl space-y-6" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input
            value={email}
            disabled
            className="bg-slate-50 text-slate-500"
          />
          <p className="text-xs text-slate-400">Email cannot be changed.</p>
        </div>

        <div className="space-y-2">
          <Label>Mobile Number</Label>
          <Input
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label>Designation</Label>
          <Input
            name="designation"
            value={formData.designation}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label>Institute/Hospital Name</Label>
          <Input
            name="instituteName"
            value={formData.instituteName}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label>City</Label>
          <Input name="city" value={formData.city} onChange={handleChange} />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
