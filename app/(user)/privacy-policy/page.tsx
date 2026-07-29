import React from "react";
export const metadata = {
    title: "Privacy Policy",
    description:
        "Read the Privacy Policy of RH Healthcare Pvt. Ltd. to understand how we collect, use, and protect your personal data.",
    alternates: {
        canonical: "https://www.rhhealthcaresimulation.com/privacy-policy",
    },
};
export default function PrivacyPolicy() {
    return (
        <div className="bg-gray-50 py-16 px-6 md:px-16">
            <div className="max-w-3xl mx-auto space-y-10">

                <h1 className="text-4xl font-extrabold text-gray-800">
                    Privacy Policy
                </h1>

                <p>
                    RH Healthcare Pvt. Ltd. is committed to protecting your privacy and ensuring that your personal information is handled securely and responsibly. This Privacy Policy explains how we collect, use, process, and safeguard your information when you use our website, services, and make payments.
                </p>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">1. Information We Collect</h2>
                    <p className="mb-2">We may collect the following information:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Personal details: name, email address, phone number</li>
                        <li>Transaction details: billing address, payment information, order history</li>
                        <li>Technical data: IP address, browser type, device information</li>
                    </ul>
                    <p className="mt-2">
                        This information is collected when you register, make a purchase, enroll in workshops, or contact us.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">2. Use of Information</h2>
                    <p className="mb-2">Your information is used to:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Process transactions and provide purchased services/products</li>
                        <li>Manage workshop registrations and orders</li>
                        <li>Improve website functionality and user experience</li>
                        <li>Communicate updates, confirmations, and support responses</li>
                        <li>Maintain internal records and comply with legal obligations</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">3. Payment Processing</h2>
                    <p className="mb-2">
                        We use secure third-party payment gateways such as HDFC SmartGateway to process payments.
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Your payment details (card, UPI, net banking) are not stored on our servers</li>
                        <li>Payment data is encrypted and processed directly by the payment gateway</li>
                        <li>We only receive transaction status and limited details required for order fulfillment</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">4. Data Sharing</h2>
                    <p className="mb-2">We do not sell or rent your personal data. However, information may be shared with:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Payment processors (e.g., HDFC SmartGateway) for transaction completion</li>
                        <li>Service providers for order fulfillment and technical operations</li>
                        <li>Legal authorities if required by applicable laws</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">5. Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational security measures to protect your data from unauthorized access, misuse, or disclosure. All sensitive transactions are processed through secure and encrypted channels.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">6. Cookies and Tracking</h2>
                    <p>
                        Our website may use cookies and similar technologies to enhance user experience, analyze traffic, and improve services.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">7. User Rights</h2>
                    <p className="mb-2">You have the right to:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Access or update your personal information</li>
                        <li>Request deletion of your data (subject to legal obligations)</li>
                        <li>Opt out of non-essential communications</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">8. Third-Party Links</h2>
                    <p>
                        Our website may contain links to external sites. We are not responsible for their privacy practices.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">9. Changes to Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. Changes will be posted on this page with updated effective dates.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">10. Contact Us</h2>
                    <p>
                        If you have any questions regarding this Privacy Policy or your data, you can contact us at:
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
