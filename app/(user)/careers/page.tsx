import React from "react";

export default function Careers() {
  return (
    <div className="px-6 py-16 md:px-16">
      <div className="mx-auto max-w-4xl p-10 text-center">
        {/* Heading */}
        <h1 className="mb-6 text-4xl font-bold text-gray-800">Careers</h1>

        {/* Content */}
        <p className="mb-6 text-lg leading-relaxed text-gray-600">
          We’re always looking for passionate and talented individuals who want
          to grow, learn, and make an impact. Even if there are no open roles
          listed, we’d love to hear from you. If you believe you can contribute
          to our team, feel free to reach out and share your profile with us.
        </p>

        <p className="mb-8 text-lg leading-relaxed text-gray-600">
          At our organization, we value innovation, collaboration, and a strong
          commitment to excellence. Join us in building meaningful experiences
          and shaping the future together.
        </p>

        {/* Email CTA */}
        <div className="rounded-xl bg-gray-50 p-6">
          <p className="mb-2 text-lg text-gray-700">
            Interested in joining us?
          </p>
          <p className="font-semibold text-gray-700">
            Mail us at:{" "}
            <a
              href="mailto:rhhealthcaresimulationcenter@gmail.com"
              className="text-blue-600 hover:underline"
            >
              rhhealthcaresimulationcenter@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
