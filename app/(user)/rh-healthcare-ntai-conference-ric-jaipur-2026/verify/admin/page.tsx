"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState<{
    isFirstDayLogged: boolean;
    isFirstDayBreakfast: boolean;
    isFirstDayLunch: boolean;
    name?: string;
    amount?: string;
  } | null>(null);
  const [fetchingStatus, setFetchingStatus] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("admin-token");
    if (storedToken === "123321") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = () => {
    if (token === "123321") {
      localStorage.setItem("admin-token", token);
      setIsAuthenticated(true);
    } else {
      alert("Invalid token");
    }
  };

  const startScanner = async () => {
    setScannedId(null);
    setScanning(true);

    // Small delay to let the DOM render the reader element
    await new Promise((r) => setTimeout(r, 100));

    const html5Qrcode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5Qrcode;

    try {
      await html5Qrcode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Extract ID from URL like: .../verify/{id}
          const match = decodedText.match(/\/verify\/([a-f0-9-]+)/i);
          const extractedId = match ? match[1] : decodedText;
          setScannedId(extractedId);
          html5Qrcode.stop().catch(console.error);
          setScanning(false);
          fetchStatus(extractedId);
        },
        () => {
          // ignore scan errors (no QR in frame)
        },
      );
    } catch (err) {
      console.error("Failed to start scanner:", err);
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(console.error);
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleScanAgain = () => {
    setScannedId(null);
    setStatus(null);
    startScanner();
  };

  const fetchStatus = async (id: string) => {
    setFetchingStatus(true);
    try {
      const res = await fetch(`/api/seminar/registration-status?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      } else {
        setStatus(null);
      }
    } catch {
      setStatus(null);
    } finally {
      setFetchingStatus(false);
    }
  };

  const markAction = async (
    endpoint: string,
    label: string,
    field: keyof NonNullable<typeof status>,
  ) => {
    if (!scannedId) return;
    try {
      const res = await fetch(`/api/seminar/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: scannedId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`${label} marked successfully!`);
        setStatus((prev) => (prev ? { ...prev, [field]: true } : prev));
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch {
      alert("Network error");
    }
  };

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <div style={{ padding: "2rem" }}>
        <input
          type="password"
          placeholder="Enter admin token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={{
            padding: "0.5rem 1rem",
            marginRight: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            padding: "0.5rem 1rem",
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "552px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "1rem" }}>Admin QR Scanner</h2>

      {!scanning && !scannedId && (
        <button
          onClick={startScanner}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Start Scanning
        </button>
      )}

      <div
        id="qr-reader"
        style={{
          width: "100%",
          display: scanning ? "block" : "none",
          marginBottom: "1rem",
        }}
      />

      {scanning && (
        <button
          onClick={stopScanner}
          style={{
            padding: "0.5rem 1rem",
            background: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "0.5rem",
          }}
        >
          Stop Scanner
        </button>
      )}

      {scannedId && (
        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ marginBottom: "1rem" }}>
            <strong>Scanned ID:</strong>{" "}
            <code
              style={{
                background: "#f3f4f6",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                wordBreak: "break-all",
              }}
            >
              {scannedId}
            </code>
          </p>

          {status?.name && (
            <p style={{ marginBottom: "1rem" }}>
              <strong>Name:</strong> {status.name}
              {status.amount && (
                <span style={{ marginLeft: "1rem" }}>
                  <strong>Amount:</strong> ₹{status.amount}
                </span>
              )}
            </p>
          )}

          {fetchingStatus ? (
            <p>Loading status...</p>
          ) : (
            <div className="flex flex-col gap-3">
              <Button
                className="h-10 rounded-none"
                onClick={() =>
                  markAction("mark-entry", "Entry", "isFirstDayLogged")
                }
                disabled={!!status?.isFirstDayLogged}
              >
                {status?.isFirstDayLogged ? "✓ Entry marked" : "Mark entry"}
              </Button>
              <Button
                className="h-10 rounded-none"
                onClick={() =>
                  markAction(
                    "mark-breakfast",
                    "Breakfast",
                    "isFirstDayBreakfast",
                  )
                }
                disabled={!!status?.isFirstDayBreakfast}
              >
                {status?.isFirstDayBreakfast
                  ? "✓ Breakfast marked"
                  : "Mark breakfast"}
              </Button>
              <Button
                className="h-10 rounded-none"
                onClick={() =>
                  markAction("mark-lunch", "Lunch", "isFirstDayLunch")
                }
                disabled={!!status?.isFirstDayLunch}
              >
                {status?.isFirstDayLunch ? "✓ Lunch marked" : "Mark lunch"}
              </Button>
            </div>
          )}

          <button
            onClick={handleScanAgain}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              background: "#6b7280",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Scan Again
          </button>
        </div>
      )}
    </div>
  );
}
