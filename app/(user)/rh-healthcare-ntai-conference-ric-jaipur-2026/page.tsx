import React, { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SeminarClient } from './seminarClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "Global Nursing Leadership & Education Summit 2026 | RH Healthcare",
    description: "Join the Global Nursing Leadership & Education Summit 2026 presented by RH Healthcare & NTAI. Celebrate nursing excellence at RIC, Jaipur.",
    alternates: {
        canonical: '/rh-healthcare-ntai-conference-ric-jaipur-2026',
    },
    openGraph: {
        images: ['https://d2c3lsl35lix55.cloudfront.net/seminar/global-submit.jpeg'],
    },
    twitter: {
        images: ['https://d2c3lsl35lix55.cloudfront.net/seminar/global-submit.jpeg'],
    },
}

const page = () => {
    return (
        <>
            <div className='max-w-xl mx-auto p-4 py-12'>
                <div className=' max-w-xl mx-auto w-full'>
                    <Image src={"https://d2c3lsl35lix55.cloudfront.net/seminar/global-submit.jpeg"} height={500} width={700} alt='seminar poster' />
                </div>
                <Content />
                <Suspense>
                    <SeminarClient />
                </Suspense>
            </div>
        </>
    )
}

export default page


function Content() {
    return (
        <div
            style={{
                fontFamily: "Arial, sans-serif",
                lineHeight: 1.6,
                color: "#333",
                maxWidth: "800px",
                margin: "0 auto",
            }}
            className=' pt-6'
        >
            <h2
                style={{
                    color: "#c62828",
                    textAlign: "center",
                }}
                className=' mb-6'
            >
                🌍 GLOBAL NURSING LEADERSHIP & EDUCATION SUMMIT 2026
            </h2>

            <h3
                style={{
                    textAlign: "center",
                    color: "#0d47a1",
                }}
            >
                🏆 Best Nurses & Nursing Educators Awards 2026
            </h3>

            <p style={{ textAlign: "center" }} className=' mb-4'>
                <strong>
                    A Step Towards Excellence, A Vision for the Future of Nursing!
                </strong>
            </p>

            <p>
                Join us for the{" "}
                <strong>Global Nursing Leadership & Education Summit 2026</strong>, a
                prestigious national event dedicated to advancing nursing education,
                leadership, innovation, and professional excellence. The summit will
                bring together nursing educators, healthcare leaders, researchers,
                students, and practitioners from across the country to share knowledge,
                celebrate achievements, and shape the future of nursing.
            </p>

            <div className="h-6"></div>
            <hr />
            <div className="h-6"></div>

            <h3>📅 Event Details</h3>

            <p>
                <strong>Date:</strong> 5th – 6th September 2026 (Saturday & Sunday)
                <br />
                <strong>Venue:</strong> Rajasthan International Centre (RIC), Jhalana
                Doongri, Jaipur, Rajasthan
                <br />
                <strong>Presented By:</strong> RH Healthcare Pvt. Ltd. & Nursing
                Teachers Association of India (NTAI)
                <br />
                <strong>Special Occasion:</strong> Celebrating Teachers&apos; Day –
                Honoring Educators, Inspiring Futures
            </p>

            <h3 className=' pt-4 font-semibold'>🔑 Summit Highlights</h3>

            <ul>
                <li>Nursing Leadership & Professional Development</li>
                <li>Nursing Education & Academic Excellence</li>
                <li>Evidence-Based Practice & Research</li>
                <li>Innovation in Healthcare & Nursing</li>
                <li>Recognition of Outstanding Nursing Professionals</li>
                <li>Best Nurses & Nursing Educators Awards 2026</li>
                <li>Networking with National Nursing Leaders & Educators</li>
            </ul>

            <h3 className=' pt-4 font-semibold'>🎯 Who Can Participate?</h3>

            <ul>
                <li>ANM Nursing Students</li>
                <li>GNM Students</li>
                <li>B.Sc Nursing Students</li>
                <li>Post Basic B.Sc Nursing Students</li>
                <li>M.Sc Nursing Students</li>
                <li>PhD Scholars</li>
                <li>Nursing Faculty & Educators</li>
                <li>Nursing Administrators</li>
                <li>Healthcare Professionals</li>
                <li>Researchers & Academicians</li>
            </ul>

            <h3 className=' pt-4 font-semibold'>🏆 Awards & Recognition</h3>

            <p>
                <strong>Best Nurses & Nursing Educators Awards 2026</strong>
                <br />
                The summit will recognize and honor exceptional contributions made by
                nursing professionals and educators in the field of healthcare and
                nursing education.
            </p>

            <h3 className=' pt-4 font-semibold'>📜 Certification & Benefits</h3>

            <ul>
                <li>Participation Certificate</li>
                <li>5 CNE Credit Hours for attending 1 day of the summit</li>
                <li>10 CNE Credit Hours for attending both days of the summit</li>
                <li>Networking Opportunities with National Experts</li>
                <li>Exposure to Latest Trends in Nursing Education & Leadership</li>
                <li>Opportunity to Showcase Research & Innovations</li>
            </ul>

            <h3 className=' pt-4 font-semibold'>📊 Event Statistics</h3>

            <ul>
                <li>👥 1000+ Delegates</li>
                <li>🏅 200+ Award Nominees</li>
                <li>🏢 20+ Exhibitors</li>
                <li>🎤 15+ National Speakers</li>
            </ul>

            <h3 className=' pt-4 font-semibold'>📍 Venue Address</h3>

            <p>
                Rajasthan International Centre (RIC)
                <br />
                Jhalana Doongri, Jaipur, Rajasthan
            </p>

            <h3>📞 Contact Details</h3>

            <p>
                📞 +91-9928907780
                <br />
                📞 +91-9829507781
                <br />
                📧 connect.rhhealth@gmail.com
            </p>

            <div
                style={{
                    marginTop: "20px",
                    padding: "15px",
                    background: "#fff8e1",
                    borderLeft: "5px solid #f9a825",
                }}
            >
                <strong>📌 Important Note:</strong>
                <br />
                All participants must join the official WhatsApp group for further
                communication, event updates, schedules, and important announcements.

                <div className=" h-4"></div>
                <Link className=' underline text-blue-600' href="https://chat.whatsapp.com/ElsWv1MjOBHBLeYWVEJbg9?s=cl&p=a&mlu=3">Join WhatsApp Group</Link>
            </div>
        </div>
    );
}