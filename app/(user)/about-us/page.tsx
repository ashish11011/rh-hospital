import SidebarForm from "./SidebarForm";

export const metadata = {
    title: "About Us",
    description:
        "Learn about RH Healthcare Pvt. Ltd., our mission, and our work in medical simulators, healthcare products, and training solutions.",
    alternates: {
        canonical: "https://www.rhhealthcaresimulation.com/about-us",
    },
};

export default function AboutPage() {

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Banner */}
            <div className="bg-primary text-white py-4">
                <div className="container">
                    <h1 className="text-2xl font-semibold">About Us</h1>
                </div>
            </div>


            {/* Main Content */}
            <div className="container py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Our Story Section */}
                        <div className="">
                            <h2 className="text-2xl font-bold text-gray-900  border-b-4 border-primary inline-block pb-1 mb-6">
                                Our Story
                            </h2>

                            <div className="  space-y-4 text-gray-700 leading-relaxed">
                                <p>
                                    RH Healthcare Pvt. Ltd. is one of India’s trusted names in the field of scientific lab equipment, hospital furniture, medical simulators, and educational training aids. Based in Jaipur, Rajasthan, the company is ISO & CE certified and is dedicated to delivering world-class healthcare and education solutions.
                                    We serve a wide client base including nursing, paramedical, pharmacy, ayurveda, and medical colleges, as well as hospitals, clinics, and diagnostic centers. Our goal is to provide innovative, reliable, and affordable products that enhance both practical training and patient care.
                                    With a robust supply chain, ready stock, fast delivery, and nationwide service, RH Healthcare has built long-lasting relationships with institutions across India. From anatomical models to complete ICU & OT setups, we offer end-to-end solutions for education and healthcare.
                                </p>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-4 border-primary inline-block pb-1">
                                    Founder & CEO
                                </h2>

                                <p>
                                    Dr. Rahul Sharma, Founder & CEO of RH Healthcare Pvt. Ltd., is a visionary entrepreneur and healthcare education leader. With deep expertise in nursing, paramedical, and medical training systems, he has dedicated his career to bridging the gap between education and industry requirements.
                                    Under his leadership, RH Healthcare has expanded from being a medical equipment supplier to a comprehensive healthcare and education solutions provider, launching initiatives such as the RH Simulation Center – an advanced skill lab that prepares students for real-world medical challenges.
                                    Dr. Sharma is also actively engaged in nursing and paramedical advocacy, consultancy for setting up new colleges, and promoting quality education through associations like RAHEA and NTAI. His mission is clear:✨ “To empower the next generation of healthcare professionals with the right tools, training, and technology.”
                                </p>
                                <h2 id='our-aim' className="text-2xl font-bold text-gray-900 border-b-4 border-primary inline-block pb-1 mb-6">
                                    Our Aim
                                </h2>

                                <p>
                                    To become a trusted partner for healthcare and education institutions by providing world-class equipment, innovative solutions, and reliable services that improve both practical training and patient care.

                                    <br />
                                    <b>Our Vision </b>
                                    To be recognized as India’s leading healthcare and education solution provider, empowering nursing, paramedical, pharmacy, and medical professionals with advanced tools, technologies, and training facilities that shape a healthier future.

                                    <br />
                                    <b>Our Mission </b>
                                    To deliver ISO & CE certified products that meet global quality standards.
                                    To provide end-to-end solutions for colleges, hospitals, and simulation centers.
                                    To bridge the gap between education and real-world healthcare needs through innovation.
                                    To maintain ready stock, fast delivery, and affordable pricing for all clients.
                                    To build long-term relationships with institutions based on trust, service, and growth.
                                </p>
                            </div>
                        </div>


                    </div>

                    {/* Right Sidebar - Contact Form */}
                    <SidebarForm />
                </div>
            </div>
        </div>
    )
}