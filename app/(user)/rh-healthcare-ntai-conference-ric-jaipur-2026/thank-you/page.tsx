import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-static";

const ThankYouPage = () => {
  return (
    <div className="flex w-full items-center justify-center px-4 py-20">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="mb-5 rounded-full bg-green-100 p-4">
            <CheckCircle2 className="h-14 w-14 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Registration Completed!
          </h1>

          <p className="text-muted-foreground mt-3 text-sm">
            Thank you for registering for the{" "}
            <span className="font-medium text-foreground">
              Global Nursing Summit 2026
            </span>
            . Your registration has been received successfully. You will receive
            a confirmation email shortly with all the conference details.
          </p>

          <p className="text-muted-foreground mt-4 text-xs">
            If you have any questions, feel free to reach out to us.
          </p>

          <Link
            href="/rh-healthcare-ntai-conference-ric-jaipur-2026"
            className="text-primary mt-6 inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Conference Page
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThankYouPage;
