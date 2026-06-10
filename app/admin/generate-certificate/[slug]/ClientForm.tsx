"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";

export function ClientForm({ workshopId }: { workshopId: string }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendEmail = async () => {
        setLoading(true);
        try {
            // Placeholder for actual send email logic
            console.log("Sending email to", name, email, "for workshop", workshopId);
            await axios.post(`/api/admin/generate-certificate/${workshopId}`, {
                name,
                email
            });
            toast.success(`Certificate will be sent to ${name} (${email})`);
            setName("");
            setEmail("");
        } catch (error) {
            console.error(error);
            toast.error("Failed to send email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Recipient Name</Label>
                <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Recipient Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <Button onClick={handleSendEmail} disabled={loading || !name || !email} className="w-full">
                {loading ? "Sending..." : "Send Email"}
            </Button>
        </div>
    );
}
