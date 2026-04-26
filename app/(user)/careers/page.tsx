import React from "react";

export default function Careers() {
    return (
        <div className=" py-16 px-6 md:px-16">
            <div className="max-w-4xl mx-auto p-10 text-center">

                {/* Heading */}
                <h1 className="text-4xl font-bold text-gray-800 mb-6">
                    Careers
                </h1>

                {/* Content */}
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    We’re always looking for passionate and talented individuals who want
                    to grow, learn, and make an impact. Even if there are no open roles
                    listed, we’d love to hear from you. If you believe you can contribute
                    to our team, feel free to reach out and share your profile with us.
                </p>

                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    At our organization, we value innovation, collaboration, and a strong
                    commitment to excellence. Join us in building meaningful experiences
                    and shaping the future together.
                </p>

                {/* Email CTA */}
                <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-gray-700 text-lg mb-2">
                        Interested in joining us?
                    </p>
                    <p className="text-gray-700 font-semibold">
                        Mail us at:{" "}
                        <a
                            href="mailto:hr@mail.com"
                            className="text-blue-600 hover:underline"
                        >
                            hr@rhhealthcare.com
                        </a>
                    </p>
                </div>

            </div>
        </div>
    );
}