import React from "react";

export const dynamic = "force-static";

export const metadata = {
    title: "Terms and Conditions",
    description:
        "Review the Terms and Conditions of RH Healthcare Pvt. Ltd. regarding the use of our services, products, and payments.",
    alternates: {
        canonical: "https://www.rhhealthcaresimulation.com/terms",
    },
};
export default function PrivacyPolicy() {
    return (
        <div className="bg-gray-50 py-16 px-6 md:px-16">
            <div className="max-w-3xl mx-auto space-y-10">

                <h1 className="text-4xl font-extrabold text-gray-800">
                    Terms and Conditions
                </h1>

                <p>
                    By accessing and using the services of RH Healthcare Pvt. Ltd., you agree to comply with and be bound by the following terms and conditions. These terms govern your use of our website, products, and services.
                </p>

                <p>
                    RH Healthcare Pvt. Ltd. provides healthcare equipment, medical simulators, educational training aids, workshops, and related services. All services are provided with a commitment to quality and reliability.
                </p>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">1. User Responsibilities</h2>
                    <p>
                        Users must provide accurate and complete information while using our services. Any misuse, fraudulent activity, or unauthorized use of the platform is strictly prohibited.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">2. Pricing and Payments</h2>
                    <p className="mb-2">
                        All prices are listed in INR and are subject to change without prior notice. Payments for products, workshops, or services must be completed before order confirmation.
                    </p>
                    <p className="mb-2">
                        We use secure third-party payment gateways such as HDFC SmartGateway for processing payments.
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Payments can be made via UPI, debit/credit cards, net banking, or other supported methods</li>
                        <li>We do not store your card or banking details on our servers</li>
                        <li>All transactions are processed securely through encrypted payment gateways</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">3. Order Confirmation</h2>
                    <p>
                        Orders or workshop registrations are confirmed only after successful payment. In case of payment failure, the order will not be processed.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">4. Refund and Cancellation</h2>
                    <p>
                        Refunds and cancellations are subject to our refund policy. Any eligible refund will be processed through the original payment method via the payment gateway.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">5. Limitation of Liability</h2>
                    <p>
                        RH Healthcare Pvt. Ltd. shall not be held liable for any indirect, incidental, or consequential damages arising from the use or inability to use our products or services, including payment-related issues beyond our control.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">6. Third-Party Services</h2>
                    <p>
                        Our website may include services provided by third parties such as payment gateways. We are not responsible for any issues arising from third-party platforms, including transaction failures or downtime.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">7. Modifications</h2>
                    <p>
                        We reserve the right to update or modify these terms at any time without prior notice. Continued use of our services implies acceptance of the updated terms.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">8. Contact Us</h2>
                    <p>
                        For any questions or concerns regarding these terms, you may contact us at:
                    </p>
                    <p className="mt-2">
                        Email:{" "}
                        <a className="text-blue-800 font-medium" href="mailto:connect.rhhealth@gmail.com">
                            connect.rhhealth@gmail.com
                        </a>
                    </p>
                </div>

            </div>
        </div>
    );
}
