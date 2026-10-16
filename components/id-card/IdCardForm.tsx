"use client";

import Image from "next/image";
import { useRef, useState, type ComponentProps, type FormEvent } from "react";
import imageCompression from "browser-image-compression";
import {
  BadgeCheck,
  Camera,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IdCardView } from "./IdCardView";
import { RhCardPrice } from "./RhCardPrice";
import {
  RH_CARD_OTHER_PROFESSION_MAX_LENGTH,
  RH_ID_CARD_VALIDITY_YEARS,
} from "@/lib/constants";
import {
  BLOOD_GROUP_OPTIONS,
  EMPTY_FORM_VALUES,
  GENDER_OPTIONS,
  PROFESSION_OPTIONS,
  QUALIFICATION_OPTIONS,
  RH_FACTOR_OPTIONS,
  makePreviewCard,
} from "./idCardUtils";
import type {
  IdCardApiResponse,
  IdCardFormValues,
  UserCardRecord,
} from "./types";

const CARD_API = "/api/auth/mobile/id-card";
const STEPS = ["Personal details", "Profession & location", "Review & create"];
const MAX_PHOTO_BYTES = 200 * 1024;
const MAX_SELECTED_PHOTO_BYTES = 1024 * 1024;

function FormInput({
  label,
  id,
  ...props
}: ComponentProps<typeof Input> & { label: string; id: string }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
        {props.required ? " *" : ""}
      </label>
      <Input id={id} className="h-11" {...props} />
    </div>
  );
}

function FormSelect({
  label,
  id,
  options,
  ...props
}: ComponentProps<"select"> & {
  label: string;
  id: string;
  options: readonly { label: string; value: string }[];
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
        {props.required ? " *" : ""}
      </label>
      <select
        id={id}
        className="focus:ring-primary h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 disabled:opacity-50"
        {...props}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function IdCardForm({
  defaults,
  onGenerated,
  pricing,
}: {
  defaults: Partial<IdCardFormValues>;
  onGenerated: (card: UserCardRecord) => void;
  pricing?: { amount: number; currency: string };
}) {
  const [values, setValues] = useState<IdCardFormValues>({
    ...EMPTY_FORM_VALUES,
    ...defaults,
  });
  const [step, setStep] = useState(0);
  const [previewing, setPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof IdCardFormValues>(
    field: K,
    value: IdCardFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === "profession" && value !== "other"
        ? { otherProfession: "" }
        : {}),
    }));
    setError("");
  }

  function navigate(nextStep: number) {
    setStep(nextStep);
    setError("");
    headingRef.current?.focus();
  }

  async function uploadPhoto(file?: File) {
    if (!file || uploading || submitting) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WEBP passport photo.");
      return;
    }
    if (file.size > MAX_SELECTED_PHOTO_BYTES) {
      setError(
        "Your photo must be 1 MB or smaller. Please choose a smaller photo.",
      );
      return;
    }
    setUploading(true);
    try {
      const photo = await imageCompression(file, {
        maxSizeMB: MAX_PHOTO_BYTES / (1024 * 1024),
        maxWidthOrHeight: 900,
        fileType: "image/jpeg",
        useWebWorker: false,
        initialQuality: 0.8,
      });
      if (photo.size > MAX_PHOTO_BYTES)
        throw new Error(
          "This photo could not be compressed. Please choose a smaller photo.",
        );
      const response = await fetch(`${CARD_API}/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: `passport-photo-${Date.now()}.jpg`,
          fileType: "image/jpeg",
        }),
        signal: AbortSignal.timeout(30000),
      });
      const upload: {
        uploadUrl?: string;
        key?: string;
        cloudfrontUrl?: string;
        error?: string;
      } = await response.json();
      if (
        !response.ok ||
        !upload.uploadUrl ||
        !upload.key ||
        !upload.cloudfrontUrl
      ) {
        throw new Error(
          upload.error || "Unable to upload your photo. Please try again.",
        );
      }
      const uploaded = await fetch(upload.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: photo,
        signal: AbortSignal.timeout(30000),
      });
      if (!uploaded.ok)
        throw new Error("Unable to upload your photo. Please try again.");
      const { key, cloudfrontUrl } = upload;
      setValues((current) => ({
        ...current,
        passportPhoto: key,
        passportPhotoUrl: cloudfrontUrl,
      }));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to upload your photo. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function generate() {
    if (submitting || uploading) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(CARD_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        signal: AbortSignal.timeout(30000),
      });
      const result: IdCardApiResponse = await response.json();
      if (!response.ok || !result.success)
        throw new Error(
          result.error ||
            "Unable to create your RH Membership Card. Please try again.",
        );
      if (result.card) {
        onGenerated(result.card);
        return;
      }
      if (!result.data?.orderId || !result.data.paymentUrl)
        throw new Error("Payment link was not generated. Please try again.");
      window.sessionStorage.setItem(
        "hdfcPaymentOrder",
        JSON.stringify({ orderId: result.data.orderId, type: "rh_id_card" }),
      );
      window.location.assign(result.data.paymentUrl);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to create your RH Membership Card. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current?.reportValidity() || uploading) return;
    const requiredText =
      step === 0
        ? [values.fullName, values.mobileNumber]
        : step === 1
          ? [
              values.state,
              values.city,
              ...(values.profession === "other"
                ? [values.otherProfession]
                : []),
            ]
          : [];
    if (requiredText.some((value) => !value.trim())) {
      setError("Please fill in all required details.");
      return;
    }
    if (step === 2) {
      if (!values.passportPhoto) {
        setError("Please upload a passport photo.");
        return;
      }
      if (!values.termsAccepted) {
        setError("Please accept the membership terms.");
        return;
      }
      setPreviewing(true);
      headingRef.current?.focus();
    } else navigate(step + 1);
  }

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const preview = makePreviewCard(values);

  return (
    <div className="space-y-6">
      <ol
        aria-label="Card creation progress"
        className="grid grid-cols-3 gap-2"
      >
        {STEPS.map((title, index) => (
          <li
            key={title}
            aria-current={step === index ? "step" : undefined}
            className={`border-t-4 pt-3 text-xs font-semibold sm:text-sm ${index <= step ? "border-primary text-primary" : "border-slate-200 text-slate-400"}`}
          >
            {index + 1}. {title}
          </li>
        ))}
      </ol>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-xl font-semibold text-slate-900 outline-none"
      >
        {previewing ? "Preview your RH Membership Card" : STEPS[step]}
      </h2>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {previewing ? (
        <div className="space-y-5">
          <IdCardView card={preview} isPreview />
          <p className="text-sm text-slate-500">
            Check your details using “Show card details”. Your RH member ID will
            be assigned after your payment is confirmed.
          </p>
          {pricing && (
            <RhCardPrice amount={pricing.amount} currency={pricing.currency} />
          )}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="h-11 px-5"
              disabled={submitting}
              onClick={() => {
                setPreviewing(false);
                setError("");
              }}
            >
              Edit details
            </Button>
            <Button
              className="h-11 px-5"
              disabled={submitting || !pricing}
              onClick={generate}
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting
                ? "Opening payment…"
                : pricing
                  ? `Pay ${new Intl.NumberFormat("en-IN", { style: "currency", currency: pricing.currency, maximumFractionDigits: 0 }).format(pricing.amount)} & create card`
                  : "Payment unavailable"}
            </Button>
          </div>
        </div>
      ) : (
        <form ref={formRef} onSubmit={next} className="space-y-6">
          <fieldset
            disabled={uploading || submitting}
            className="grid gap-5 sm:grid-cols-2"
          >
            <legend className="sr-only">{STEPS[step]}</legend>
            {step === 0 && (
              <>
                <FormInput
                  id="card-name"
                  label="Full name"
                  required
                  autoComplete="name"
                  value={values.fullName}
                  onChange={(event) => update("fullName", event.target.value)}
                />
                <FormInput
                  id="card-email"
                  label="Email"
                  type="email"
                  readOnly
                  value={values.email}
                  className="h-11 bg-slate-50 text-slate-500"
                />
                <FormInput
                  id="card-phone"
                  label="Mobile number"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={values.mobileNumber}
                  onChange={(event) =>
                    update("mobileNumber", event.target.value)
                  }
                />
                <FormSelect
                  id="card-gender"
                  label="Gender"
                  required
                  options={GENDER_OPTIONS}
                  value={values.gender}
                  onChange={(event) =>
                    update(
                      "gender",
                      event.target.value as IdCardFormValues["gender"],
                    )
                  }
                />
                <FormInput
                  id="card-dob"
                  label="Date of birth"
                  type="date"
                  required
                  max={today}
                  value={values.dateOfBirth}
                  onChange={(event) =>
                    update("dateOfBirth", event.target.value)
                  }
                />
                <FormSelect
                  id="card-blood"
                  label="Blood group"
                  options={BLOOD_GROUP_OPTIONS}
                  value={values.bloodGroup}
                  onChange={(event) =>
                    update(
                      "bloodGroup",
                      event.target.value as IdCardFormValues["bloodGroup"],
                    )
                  }
                />
                <FormSelect
                  id="card-rh"
                  label="RH factor"
                  options={RH_FACTOR_OPTIONS}
                  value={values.rhFactor}
                  onChange={(event) =>
                    update(
                      "rhFactor",
                      event.target.value as IdCardFormValues["rhFactor"],
                    )
                  }
                />
              </>
            )}
            {step === 1 && (
              <>
                <FormSelect
                  id="card-profession"
                  label="Profession"
                  required
                  options={PROFESSION_OPTIONS}
                  value={values.profession}
                  onChange={(event) =>
                    update(
                      "profession",
                      event.target.value as IdCardFormValues["profession"],
                    )
                  }
                />
                {values.profession === "other" && (
                  <FormInput
                    id="card-other-profession"
                    label="Your profession"
                    required
                    maxLength={RH_CARD_OTHER_PROFESSION_MAX_LENGTH}
                    placeholder="Enter your profession"
                    value={values.otherProfession}
                    onChange={(event) =>
                      update("otherProfession", event.target.value)
                    }
                  />
                )}
                <FormSelect
                  id="card-qualification"
                  label="Qualification"
                  required
                  options={QUALIFICATION_OPTIONS}
                  value={values.qualification}
                  onChange={(event) =>
                    update(
                      "qualification",
                      event.target.value as IdCardFormValues["qualification"],
                    )
                  }
                />
                <FormInput
                  id="card-organization"
                  label="Organization name"
                  autoComplete="organization"
                  placeholder="College, hospital, or organization"
                  value={values.organizationName}
                  onChange={(event) =>
                    update("organizationName", event.target.value)
                  }
                />
                <FormInput
                  id="card-state"
                  label="State"
                  required
                  autoComplete="address-level1"
                  value={values.state}
                  onChange={(event) => update("state", event.target.value)}
                />
                <FormInput
                  id="card-city"
                  label="City"
                  required
                  autoComplete="address-level2"
                  value={values.city}
                  onChange={(event) => update("city", event.target.value)}
                />
              </>
            )}
            {step === 2 && (
              <>
                <div className="space-y-3 sm:col-span-2">
                  <label
                    htmlFor="card-photo"
                    className="text-sm font-medium text-slate-700"
                  >
                    Passport photo *
                  </label>
                  <div
                    aria-busy={uploading}
                    className={`rounded-2xl border-2 border-dashed p-5 transition-colors sm:p-6 ${values.passportPhoto ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-gradient-to-br from-slate-50 to-emerald-50/60"}`}
                  >
                    <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                      <div className="relative flex h-32 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white bg-white shadow-sm ring-1 ring-slate-200/70">
                        {values.passportPhotoUrl ? (
                          <Image
                            src={values.passportPhotoUrl}
                            alt="Your uploaded passport photo"
                            width={96}
                            height={128}
                            unoptimized
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-emerald-700/60">
                            <Camera
                              aria-hidden="true"
                              className="size-8"
                              strokeWidth={1.5}
                            />
                            <span className="text-[10px] font-medium tracking-widest uppercase">
                              Your photo
                            </span>
                          </div>
                        )}
                        {uploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                            <Loader2
                              aria-hidden="true"
                              className="size-6 animate-spin text-emerald-700"
                            />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-3">
                        <div>
                          <p
                            role="status"
                            className="flex items-center gap-2 text-sm font-semibold text-slate-900"
                          >
                            {uploading ? (
                              "Uploading your photo…"
                            ) : values.passportPhoto ? (
                              <>
                                <BadgeCheck
                                  aria-hidden="true"
                                  className="size-4 text-emerald-600"
                                />
                                Photo uploaded
                              </>
                            ) : (
                              "Add a face to your membership"
                            )}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            Use a clear, front-facing portrait with a plain
                            background.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-10 gap-2 border-emerald-200 bg-white px-4 text-emerald-800 shadow-sm hover:bg-emerald-50 hover:text-emerald-900"
                            aria-controls="card-photo"
                            aria-describedby="card-photo-help"
                            onClick={() => photoInputRef.current?.click()}
                            disabled={uploading || submitting}
                          >
                            {values.passportPhoto ? (
                              <ImagePlus
                                aria-hidden="true"
                                className="size-4"
                              />
                            ) : (
                              <Upload aria-hidden="true" className="size-4" />
                            )}
                            {uploading
                              ? "Uploading…"
                              : values.passportPhoto
                                ? "Replace photo"
                                : "Choose photo"}
                          </Button>
                          {values.passportPhoto && (
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-10 gap-2 px-3 text-slate-500 hover:text-red-600"
                              disabled={uploading || submitting}
                              onClick={() =>
                                setValues((current) => ({
                                  ...current,
                                  passportPhoto: "",
                                  passportPhotoUrl: "",
                                }))
                              }
                            >
                              <Trash2 aria-hidden="true" className="size-4" />
                              Remove photo
                            </Button>
                          )}
                        </div>
                        <p
                          id="card-photo-help"
                          className="text-xs text-slate-500"
                        >
                          JPG, PNG or WEBP · Max 1 MB
                        </p>
                        <input
                          ref={photoInputRef}
                          id="card-photo"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          aria-describedby="card-photo-help"
                          className="sr-only"
                          tabIndex={-1}
                          disabled={uploading || submitting}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            event.target.value = "";
                            void uploadPhoto(file);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <FormInput
                  id="card-referral"
                  label="Referral code (optional)"
                  value={values.referralCode}
                  onChange={(event) =>
                    update("referralCode", event.target.value)
                  }
                />
                <FormInput
                  id="card-hear"
                  label="How did you hear about RH? (optional)"
                  value={values.hearAboutRh}
                  onChange={(event) =>
                    update("hearAboutRh", event.target.value)
                  }
                />
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900 sm:col-span-2">
                  <p className="font-semibold">RH membership</p>
                  {pricing && (
                    <div className="mt-2">
                      <RhCardPrice
                        amount={pricing.amount}
                        currency={pricing.currency}
                      />
                    </div>
                  )}
                  <p className="mt-1">
                    {pricing
                      ? `Pay ${new Intl.NumberFormat("en-IN", { style: "currency", currency: pricing.currency, maximumFractionDigits: 0 }).format(pricing.amount)} after reviewing your details. `
                      : "Payment is required after reviewing your details. "}
                    Your card is activated after successful payment and is valid
                    for {RH_ID_CARD_VALIDITY_YEARS} years from activation.
                  </p>
                </div>
                <label className="flex items-start gap-3 text-sm leading-6 text-slate-600 sm:col-span-2">
                  <input
                    type="checkbox"
                    required
                    className="accent-primary mt-1 size-4 shrink-0"
                    checked={values.termsAccepted}
                    onChange={(event) =>
                      update("termsAccepted", event.target.checked)
                    }
                  />
                  <span>
                    I confirm my details are correct and accept the RH
                    Healthcare Membership terms.
                  </span>
                </label>
              </>
            )}
          </fieldset>
          <div className="flex justify-between gap-3 border-t border-slate-100 pt-5">
            <Button
              type="button"
              variant="outline"
              className="h-11 px-5"
              disabled={step === 0 || uploading}
              onClick={() => navigate(step - 1)}
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>
            <Button type="submit" className="h-11 px-5" disabled={uploading}>
              {step === 2 ? "Preview card" : "Continue"}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
