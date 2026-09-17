import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import React from "react";

export const dynamic = "force-static";

const page = () => {
  return (
    <div className="flex w-full items-center justify-center py-20">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="mb-5 rounded-full bg-green-100 p-4">
            <CheckCircle2 className="h-14 w-14 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Payment Successful
          </h1>

          <p className="text-muted-foreground mt-3 text-sm">
            Your registration has been completed successfully. You will receive
            a confirmation email shortly with all the details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default page;
