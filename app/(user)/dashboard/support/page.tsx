import { SupportForm } from "@/components/dashboard/support-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { checkAuthGetUser } from "../action";

export default async function SupportPage() {
  const userProfile = await checkAuthGetUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Support Center
        </h1>
        <p className="mt-1 text-slate-500">
          Find answers to common questions or raise a ticket.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* FAQs Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                How do I access my certificates?
              </AccordionTrigger>
              <AccordionContent>
                You can access your certificates from the "My Certificates" tab
                in the dashboard once you have successfully completed a course
                or workshop.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                I can't log in to my account. What should I do?
              </AccordionTrigger>
              <AccordionContent>
                If you are having trouble logging in, please try resetting your
                password using the "Forgot Password" link on the sign-in page.
                If the issue persists, please raise a ticket.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                How do I update my profile information?
              </AccordionTrigger>
              <AccordionContent>
                Navigate to the "Profile" section in your dashboard. From there,
                you can update your name, contact number, and other personal
                details. Note that your registered email address cannot be
                changed.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                Where can I see the workshops I registered for?
              </AccordionTrigger>
              <AccordionContent>
                All your upcoming and past registered workshops are listed under
                the "Workshops" section in this dashboard.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Raise a Ticket Section */}
        <div className="h-fit rounded-xl border border-slate-100 bg-slate-50 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Raise a Ticket
          </h2>
          <SupportForm
            user={{
              name: userProfile?.name || "Dashboard User",
              email: userProfile?.email || "",
              mobileNumber: userProfile?.mobileNumber || "",
            }}
          />
        </div>
      </div>
    </div>
  );
}
