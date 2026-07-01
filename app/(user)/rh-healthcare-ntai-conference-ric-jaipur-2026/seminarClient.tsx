"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomRadioGroup } from "@/components/custom-radio-group";
import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { RAZORPAY_KEY } from "@/env";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

export const registrationSchema = z
  .object({
    name: z.string().min(2),

    gender: z.enum(["male", "female", "other"]),

    mobileNumber: z.string().regex(/^[6-9]\d{9}$/),

    email: z.string().email(),

    designation: z.string().min(2),

    // institution: z.string().min(2),

    instituteName: z.string().min(2),

    // addressLine1: z.string().min(5),

    // addressLine2: z.string().optional(),

    city: z.string().min(2),

    state: z.string().min(2),

    // country: z.string().min(2),

    // pincode: z.string().regex(/^\d{6}$/),

    presentationType: z.enum(["paper", "poster", "online_paper", "no"]),

    presentationTitle: z.string().optional(),

    authorName: z.string().optional(),

    paperInstitution: z.string().optional(),

    additionalDetails: z.string().optional(),

    motivatedBy: z.enum(["person", "social_media", "other"]),

    referencePersonName: z.string().optional(),

    referencePersonMobile: z.string().optional(),

    socialMediaName: z.string().optional(),

    registrationMode: z.enum(["online", "offline"]),

    offlineDuration: z.enum(["one_day", "two_day"]).optional(),

    isNaitMember: z.boolean(),

    naitRegistrationId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.presentationType === "paper" ||
      data.presentationType === "poster" ||
      data.presentationType === "online_paper"
    ) {
      if (!data.presentationTitle) {
        ctx.addIssue({
          code: "custom",
          path: ["presentationTitle"],
          message: "Presentation title is required",
        });
      }

      // if (!data.authorName) {
      //     ctx.addIssue({
      //         code: "custom",
      //         path: ["authorName"],
      //         message: "Author name is required",
      //     });
      // }

      // if (!data.paperInstitution) {
      //     ctx.addIssue({
      //         code: "custom",
      //         path: ["paperInstitution"],
      //         message: "Institution is required",
      //     });
      // }
    }

    if (data.motivatedBy === "person") {
      if (!data.referencePersonName) {
        ctx.addIssue({
          code: "custom",
          path: ["referencePersonName"],
          message: "Person name is required",
        });
      }

      // if (!data.referencePersonMobile) {
      //     ctx.addIssue({
      //         code: "custom",
      //         path: ["referencePersonMobile"],
      //         message: "Mobile number is required",
      //     });
      // }
    }

    if (data.motivatedBy === "social_media" && !data.socialMediaName) {
      ctx.addIssue({
        code: "custom",
        path: ["socialMediaName"],
        message: "Social media name is required",
      });
    }

    if (data.registrationMode === "offline" && !data.offlineDuration) {
      ctx.addIssue({
        code: "custom",
        path: ["offlineDuration"],
        message: "Select duration",
      });
    }
    if (
      data.registrationMode === "online" &&
      (data.presentationType === "paper" || data.presentationType === "poster")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["offlineDuration"],
        message: "Presenters must register offline for two days",
      });
    }

    if (
      (data.presentationType === "paper" ||
        data.presentationType === "poster") &&
      data.registrationMode === "offline" &&
      data.offlineDuration === "one_day"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["offlineDuration"],
        message: "Presenters must register for two days",
      });
    }

    if (data.isNaitMember) {
      if (!data.naitRegistrationId) {
        ctx.addIssue({
          code: "custom",
          path: ["naitRegistrationId"],
          message: "NTAI Registration ID is required",
        });
      }
      // else if (!/^NTA\/\d{4}LM\d{8,9}$/.test(data.naitRegistrationId)) {
      //   ctx.addIssue({
      //     code: "custom",
      //     path: ["naitRegistrationId"],
      //     message: "Invalid NTAI membership number",
      //   });
      // }
    }
  });

const SeminarClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [designationType, setDesignationType] = useState("");
  useEffect(() => {
    const loadScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadScript();
  }, []);

  useEffect(() => {
    const utmSource = searchParams.get("utm_source");
    const utmMedium = searchParams.get("utm_medium");
    const utmCampaign = searchParams.get("utm_campaign");
    const utmContent = searchParams.get("utm_content");

    setForm((prev: any) => ({
      ...prev,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
    }));
  }, [searchParams]);

  const [form, setForm] = useState<any>({
    name: "",
    gender: "",
    mobileNumber: "",
    email: "",
    designation: "",
    // institution: "",
    instituteName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    presentationType: "no",
    presentationTitle: "",
    // authorName: "",
    // paperInstitution: "",
    additionalDetails: "",
    motivatedBy: "",
    referencePersonName: "",
    referencePersonMobile: "",
    socialMediaName: "",
    registrationMode: "online",
    offlineDuration: "",
    isNaitMember: "no",
    naitRegistrationId: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const amount = useMemo(() => {
    const isNait = form.isNaitMember === "yes";

    if (form.presentationType === "online_paper") {
      return isNait ? 1400 : 1400;
    }

    if (form.registrationMode === "online") {
      return isNait ? 400 : 500;
    }

    if (
      form.registrationMode === "offline" &&
      form.offlineDuration === "one_day"
    ) {
      return isNait ? 1000 : 1500;
    }

    if (
      form.registrationMode === "offline" &&
      form.offlineDuration === "two_day"
    ) {
      return isNait ? 2000 : 2500;
    }

    return 0;
  }, [form]);

  const handleSubmit = async () => {
    setLoading(true);
    const data: any = {
      ...form,
      paperPresentation:
        form.presentationType === "paper" ||
        form.presentationType === "poster" ||
        form.presentationType === "online_paper",
      isNaitMember: form.isNaitMember === "yes" ? true : false,
    };
    if (data.registrationMode !== "offline" || !data.offlineDuration) {
      delete data.offlineDuration;
    }
    const zodResult = registrationSchema.safeParse(data);
    if (!zodResult.success) {
      const firstError = zodResult.error.issues[0];
      let errorMsg =
        firstError?.message || "Please check all fields and try again.";

      if (firstError?.path && firstError.path.length > 0) {
        const fieldName = String(firstError.path[0]);
        const formattedField =
          fieldName.charAt(0).toUpperCase() +
          fieldName.slice(1).replace(/([A-Z])/g, " $1");
        errorMsg = `Please enter valid : ${formattedField}`;
      }

      toast.error(errorMsg);
      console.log("Validation Errors:", zodResult.error.flatten().fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/seminar/register", data);
      const responseData = res.data.data;

      if (!responseData) throw new Error("Request Failed, please try again");

      const options = {
        key: RAZORPAY_KEY, // Replace with your Razorpay key_id
        amount: responseData.amount, // Use dynamic amount
        currency: responseData.currency,
        name: form.name,
        description: "Registration for seminar",
        order_id: responseData.id, // Use backend order_id
        handler: async function (response: any) {
          const res = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(response),
          });

          const data = await res.json();

          if (data.success) {
            toast.success("Payment successful, your registration is confirmed");
            router.push("/payment-success");
          } else if (data.status == 400) {
            toast.error("Payment failed");
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.mobileNumber,
        },
        theme: {
          color: "#2e7d32",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        console.log("Payment Failed:", response);
        toast.error("Payment failed");
      });

      rzp.open();

      // clear the form after successfull payment
      setForm({
        name: "",
        gender: "",
        mobileNumber: "",
        email: "",
        designation: "",
        // institution: "",
        instituteName: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        presentationType: "no",
        presentationTitle: "",
        // authorName: "",
        // paperInstitution: "",
        additionalDetails: "",
        motivatedBy: "",
        referencePersonName: "",
        referencePersonMobile: "",
        socialMediaName: "",
        registrationMode: "online",
        offlineDuration: "",
        isNaitMember: "no",
        naitRegistrationId: "",
      });
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <div className="">
      <div className="grid gap-4 py-4">
        <p className="mt-6 text-xl">Basic Information</p>
        <Separator className="-mt-4" />

        <div className="space-y-1">
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label>Gender</Label>
          <Select
            value={form.gender}
            onValueChange={(val) => handleChange("gender", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Mobile Number</Label>
          <Input
            value={form.mobileNumber}
            onChange={(e) => handleChange("mobileNumber", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label>Designation</Label>
          <Select
            onValueChange={(val) => {
              setDesignationType(val);
              if (val !== "other") {
                handleChange("designation", val);
              } else {
                handleChange("designation", "");
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Designation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="PHD scholar">PHD scholar</SelectItem>
              <SelectItem value="Clinical nurse">Clinical nurse</SelectItem>
              <SelectItem value="Nursing teacher">Nursing teacher</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {designationType === "other" && (
            <div className="pt-2">
              <Input
                placeholder="Enter your designation"
                value={form.designation}
                onChange={(e) => handleChange("designation", e.target.value)}
              />
            </div>
          )}
        </div>

        {/* <div className="space-y-1">
                    <Label>Qualification</Label>
                    <Input
                        value={form.qualification}
                        onChange={(e) =>
                            handleChange("qualification", e.target.value)
                        }
                    />
                </div> */}

        <div className="space-y-1">
          <Label>Institution / Organization</Label>
          <Input
            value={form.instituteName}
            onChange={(e) => handleChange("instituteName", e.target.value)}
          />
        </div>

        <p className="mt-12 text-xl">Address</p>
        <Separator className="-mt-4" />

        {/* <div className="space-y-1">
                    <Label>Address Line 1</Label>
                    <Input
                        value={form.addressLine1}
                        onChange={(e) =>
                            handleChange("addressLine1", e.target.value)
                        }
                    />
                </div>

                <div className="space-y-1">
                    <Label>Address Line 2</Label>
                    <Input
                        value={form.addressLine2}
                        onChange={(e) =>
                            handleChange("addressLine2", e.target.value)
                        }
                    />
                </div> */}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>City</Label>
            <Input
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>

          <div>
            <Label>State</Label>
            <Input
              value={form.state}
              onChange={(e) => handleChange("state", e.target.value)}
            />
          </div>

          {/* <div>
                        <Label>Country</Label>
                        <Input
                            value={form.country}
                            onChange={(e) =>
                                handleChange("country", e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label>Pincode</Label>
                        <Input
                            value={form.pincode}
                            onChange={(e) =>
                                handleChange("pincode", e.target.value)
                            }
                        />
                    </div> */}
        </div>

        <p className="mt-12 text-xl">Presentation Participation</p>
        <Separator className="-mt-4" />

        <CustomRadioGroup
          label="Presentation Participation"
          value={form.presentationType}
          onChange={(val) => {
            handleChange("presentationType", val);
            if (val === "paper" || val === "poster") {
              handleChange("registrationMode", "offline");
              handleChange("offlineDuration", "two_day");
            } else if (val === "online_paper") {
              handleChange("registrationMode", "online");
            }
          }}
          options={[
            {
              id: "presentation-paper",
              value: "paper",
              title: "Paper Presentation",
              description: "I will present a paper.",
            },
            {
              id: "presentation-poster",
              value: "poster",
              title: "Poster Presentation",
              description: "I will present a poster.",
            },
            {
              id: "presentation-no",
              value: "no",
              title: "No",
              description: "I will not present.",
            },
            {
              id: "online-presentation",
              value: "online_paper",
              title: "Online Paper Presentation",
              description: "I will present a paper online.",
            },
          ]}
        />

        {(form.presentationType === "paper" ||
          form.presentationType === "poster" ||
          form.presentationType === "online_paper") && (
          <>
            <div>
              <Label>
                Title of{" "}
                {form.presentationType === "poster" ? "Poster" : "Paper"}
              </Label>
              <Input
                value={form.presentationTitle}
                onChange={(e) =>
                  handleChange("presentationTitle", e.target.value)
                }
              />
            </div>

            {/* <div>
                            <Label>Author Name</Label>
                            <Input
                                value={form.authorName}
                                onChange={(e) =>
                                    handleChange("authorName", e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <Label>Institution / Organization</Label>
                            <Input
                                value={form.paperInstitution}
                                onChange={(e) =>
                                    handleChange(
                                        "paperInstitution",
                                        e.target.value
                                    )
                                }
                            />
                        </div> */}
          </>
        )}

        <div className="mt-1">
          <Label>Any Other Details (Optional)</Label>
          <Textarea
            value={form.additionalDetails}
            onChange={(e) => handleChange("additionalDetails", e.target.value)}
          />
        </div>

        {form.presentationType === "no" && (
          <>
            <p className="mt-12 text-xl">Registration Type</p>
            <Separator className="-mt-4" />

            <CustomRadioGroup
              label="Mode Of Registration"
              value={form.registrationMode}
              onChange={(val) => handleChange("registrationMode", val)}
              options={[
                {
                  id: "online",
                  value: "online",
                  title: "Online",
                  description: "Attend virtually/remotely via internet",
                },
                {
                  id: "offline",
                  value: "offline",
                  title: "Offline",
                  description: "Attend physically at location.",
                },
              ]}
            />
          </>
        )}

        <div className="h-1"></div>
        <CustomRadioGroup
          label="Are You NTAI Member?"
          value={form.isNaitMember}
          onChange={(val) => handleChange("isNaitMember", val)}
          options={[
            {
              id: "nait-yes",
              value: "yes",
              title: "Yes",
              description: "I am a registered NTAI member.",
            },
            {
              id: "nait-no",
              value: "no",
              title: "No",
              description: "I am not a NTAI member.",
            },
          ]}
        />

        {form.isNaitMember === "yes" && (
          <div className="mt-4 space-y-1">
            <Label>NTAI Registration ID</Label>
            <Input
              value={form.naitRegistrationId}
              onChange={(e) =>
                handleChange("naitRegistrationId", e.target.value)
              }
            />
          </div>
        )}

        {form.registrationMode === "offline" &&
          form.presentationType === "no" && (
            <div className="mt-4">
              <CustomRadioGroup
                label="Duration"
                value={form.offlineDuration}
                onChange={(val) => handleChange("offlineDuration", val)}
                options={[
                  {
                    id: "one-day",
                    value: "one_day",
                    title: "One Day",
                    description: (
                      <>
                        Attend for a single day.
                        <br />
                        <span className="text-gray-800">
                          Rs. {form.isNaitMember === "yes" ? 1000 : 1500}
                        </span>
                      </>
                    ),
                    disabled: form.presentationType !== "no",
                  },
                  {
                    id: "two-day",
                    value: "two_day",
                    title: "Two Day",
                    description: (
                      <>
                        Attend both days.
                        <br />
                        <span className="text-gray-800">
                          Rs. {form.isNaitMember === "yes" ? 2000 : 2500}
                        </span>
                      </>
                    ),
                  },
                ]}
              />
            </div>
          )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="mt-6">
          <Label>Motivated By</Label>

          <Select
            value={form.motivatedBy}
            onValueChange={(val) => handleChange("motivatedBy", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="person">Person</SelectItem>
              <SelectItem value="social_media">Social Media</SelectItem>
              {/* <SelectItem value="other">Other</SelectItem> */}
            </SelectContent>
          </Select>
        </div>

        {form.motivatedBy === "person" && (
          <>
            <Input
              placeholder="Person Name"
              value={form.referencePersonName}
              onChange={(e) =>
                handleChange("referencePersonName", e.target.value)
              }
            />

            <Input
              placeholder="Person Mobile Number"
              value={form.referencePersonMobile}
              onChange={(e) =>
                handleChange("referencePersonMobile", e.target.value)
              }
            />
          </>
        )}

        {form.motivatedBy === "social_media" && (
          <Select
            value={form.socialMediaName}
            onValueChange={(val) => handleChange("socialMediaName", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Social Media" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="mt-6">
        <p className="text-lg font-semibold">Registration Fee: ₹{amount}</p>
      </div>

      <div className="pt-4">
        <Link
          className="text-blue-600 underline"
          href="https://chat.whatsapp.com/ElsWv1MjOBHBLeYWVEJbg9?s=cl&p=a&mlu=3"
        >
          Join WhatsApp Group
        </Link>
      </div>

      <div className="mt-4 flex items-center space-x-2">
        <Checkbox
          checked={isChecked}
          onCheckedChange={(checked) => setIsChecked(checked === true)}
          id="terms"
        />
        <Label htmlFor="terms">Yes, i have joinded whatsapp group.</Label>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading || !isChecked}
        className="mt-4 h-10 w-full"
      >
        {loading ? "Processing..." : `₹ ${amount} Pay`}
      </Button>
    </div>
  );
};

export { SeminarClient };
