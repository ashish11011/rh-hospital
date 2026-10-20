"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type WorkshopMemberDetails = {
  name: string;
  email: string;
  mobileNumber: string;
  designation: string;
  instituteName: string;
  city: string;
};

export function MemberWorkshopVerification({
  workshopId,
  onVerified,
}: {
  workshopId: string;
  onVerified: (details: WorkshopMemberDetails, expiresIn: number) => void;
}) {
  const [registrationId, setRegistrationId] = useState("");
  const [challenge, setChallenge] = useState<{
    challengeId: string;
    maskedEmail: string;
  } | null>(null);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [retryUntil, setRetryUntil] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!retryUntil) return;
    const timer = setInterval(() => {
      const seconds = Math.max(0, Math.ceil((retryUntil - Date.now()) / 1000));
      setRemaining(seconds);
      if (!seconds) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [retryUntil]);

  function showError(cause: unknown) {
    if (axios.isAxiosError(cause)) {
      setError(
        cause.response?.data?.message ||
          "Unable to verify membership. Please try again.",
      );
      if (cause.response?.status === 429) {
        const seconds = Number(cause.response.data.retryAfter || 300);
        setRemaining(seconds);
        setRetryUntil(Date.now() + seconds * 1000);
      }
    } else setError("Unable to verify membership. Please try again.");
  }

  async function sendOtp() {
    setBusy(true);
    setError("");
    try {
      const { data } = await axios.post("/api/workshop/member/send-otp", {
        registrationId,
        workshopId,
      });
      if (mounted.current) {
        setChallenge(data.data);
        setOtp("");
      }
    } catch (cause) {
      showError(cause);
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp() {
    if (!challenge) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await axios.post("/api/workshop/member/verify-otp", {
        workshopId,
        challengeId: challenge.challengeId,
        otp,
      });
      if (mounted.current) onVerified(data.data.details, data.data.expiresIn);
    } catch (cause) {
      showError(cause);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4">
      <p className="text-sm text-gray-600">
        Verify your active paid RH Membership Card to get 20% off the listed
        workshop fee. We’ll email an OTP to the address registered with your
        card.
      </p>
      <div className="space-y-2">
        <Label htmlFor="workshop-member-id">RH registration ID</Label>
        <Input
          id="workshop-member-id"
          placeholder="RH-NUR-2026-0001"
          value={registrationId}
          disabled={busy}
          onChange={(event) => {
            setRegistrationId(event.target.value);
            setChallenge(null);
            setOtp("");
            setError("");
          }}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={sendOtp}
        disabled={busy || remaining > 0 || !registrationId.trim()}
      >
        {busy
          ? "Please wait…"
          : remaining > 0
            ? `Try again in ${remaining}s`
            : challenge
              ? "Resend OTP"
              : "Send OTP"}
      </Button>
      {/* <p className="text-xs text-gray-500">
        Maximum 3 OTP emails per 5 minutes, including resends.
      </p> */}
      {challenge && (
        <div className="space-y-3">
          <p role="status" className="text-sm text-gray-600">
            OTP sent to {challenge.maskedEmail}. It expires in 5 minutes. Enter
            the latest code.
          </p>
          <Label htmlFor="workshop-member-otp">Email OTP</Label>
          <Input
            id="workshop-member-otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
            disabled={busy}
          />
          <Button
            type="button"
            onClick={verifyOtp}
            disabled={busy || otp.length !== 6}
          >
            Verify membership
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
