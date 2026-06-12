"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getCertificateUser } from "@/actions/registrationActions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function CourseCertificateForm({ workshopId }: { workshopId: string }) {
    const [searchType, setSearchType] = useState<"email" | "number">("email");
    const [searchValue, setSearchValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchValue) {
            toast.error(`Please enter your ${searchType === "email" ? "Email" : "Mobile Number"}`);
            return;
        }

        setLoading(true);
        setCertificateUrl(null);
        try {
            const res = await getCertificateUser(workshopId, searchType, searchValue);
            if (res.success && res.certificateUrl) {
                setCertificateUrl(res.certificateUrl);
                toast.success("Certificate found!");
            } else {
                toast.error(res.message || "Certificate not found");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-8 bg-card p-6 rounded-lg border shadow-sm mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <Label className="text-base font-semibold">Search By</Label>
                    <RadioGroup
                        value={searchType}
                        onValueChange={(val: "email" | "number") => {
                            setSearchType(val);
                            setSearchValue("");
                        }}
                        className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="email" id="email" />
                            <Label htmlFor="email" className="font-normal cursor-pointer">Email Address</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="number" id="number" />
                            <Label htmlFor="number" className="font-normal cursor-pointer">Mobile Number</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="searchValue">
                        Enter your {searchType === "email" ? "Email Address" : "Mobile Number"}
                    </Label>
                    <Input
                        id="searchValue"
                        type={searchType === "email" ? "email" : "text"}
                        placeholder={searchType === "email" ? "john@example.com" : "9876543210"}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-full"
                    />
                </div>

                <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Search Certificate
                </Button>
            </form>

            {certificateUrl && (
                <div className="pt-6 border-t space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="p-4 bg-green-50 text-green-900 rounded-md border border-green-200">
                        <p className="font-medium text-sm text-center">🎉 Certificate is ready to download</p>
                    </div>
                    <Button asChild variant="default" className="w-full h-11 bg-green-600 hover:bg-green-700 text-white">
                        <a href={`https://d2c3lsl35lix55.cloudfront.net${certificateUrl}`} target="_blank" rel="noopener noreferrer">
                            Download Certificate
                        </a>
                    </Button>
                </div>
            )}
        </div>
    );
}
