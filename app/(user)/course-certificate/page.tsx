import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course Certificates | RH Healthcare",
  description:
    "View and download your healthcare and medical training course certificates from RH Healthcare.",
  alternates: {
    canonical: "/course-certificate",
  },
};

const page = () => {
  const workshopData = [
    {
      idx: 5,
      id: "b4f95ab7-9ae7-46f8-8dac-bb6d299b3ec0",
      name: "SIMTECH",
      bannerImage:
        "https://d2c3lsl35lix55.cloudfront.net/workshops/banner/1779450554173-WhatsApp_Image_2026-05-22_at_10.25.55_AM__1_.jpeg",
      start_time: "2026-06-06 04:00:00",
      end_time: "2026-06-06 10:30:00",
      online_price: 300,
      offline_price: 500,
      is_completed: true,
    },
    {
      idx: 6,
      id: "d3e7ec2d-a91a-42bb-8764-2334aa270e63",
      name: "BIO-SHIELD WORKSHOP",
      bannerImage:
        "https://d2c3lsl35lix55.cloudfront.net/workshops/banner/1781088670841-bio-shild.png",
      description:
        "🛡️ BIO-SHIELD WORKSHOP 2026 is a specialized infection control training program designed for healthcare professionals and students. Participants will gain practical knowledge of hand hygiene, PPE usage, biomedical waste management, and infection prevention practices while earning a Certificate of Participation and 5 Credit Hours.",
      content:
        '<p>🛡️&nbsp;<strong>BIO-SHIELD&nbsp;WORKSHOP&nbsp;2026</strong></p><p>&nbsp;<strong>INFECTION&nbsp;CONTROL&nbsp;EXCELLENCE&nbsp;PROGRAM</strong></p><p></p><p>&nbsp;<em>&quot;Enhancing&nbsp;Infection&nbsp;Prevention&nbsp;&amp;&nbsp;Patient&nbsp;Safety&nbsp;Through&nbsp;Practical&nbsp;Learning&quot;</em></p><p></p><p>Join&nbsp;us&nbsp;for&nbsp;<strong>“BIO-SHIELD&nbsp;WORKSHOP&nbsp;2026”</strong>,&nbsp;a&nbsp;specialized&nbsp;infection&nbsp;control&nbsp;workshop&nbsp;designed&nbsp;to&nbsp;equip&nbsp;healthcare&nbsp;professionals&nbsp;and&nbsp;students&nbsp;with&nbsp;essential&nbsp;knowledge&nbsp;and&nbsp;practical&nbsp;skills&nbsp;in&nbsp;infection&nbsp;prevention,&nbsp;hand&nbsp;hygiene,&nbsp;biomedical&nbsp;waste&nbsp;management,&nbsp;and&nbsp;workplace&nbsp;safety.</p><p></p><p>📅&nbsp;<strong>Date:</strong>&nbsp;27&nbsp;June&nbsp;2026</p><p>&nbsp;⏰&nbsp;<strong>Time:</strong>&nbsp;9:30&nbsp;AM&nbsp;–&nbsp;4:00&nbsp;PM</p><p>📍&nbsp;<strong>Venue:</strong>&nbsp;RH&nbsp;Healthcare&nbsp;Simulation&nbsp;Center,&nbsp;Triveni&nbsp;Nagar&nbsp;Chouraha,&nbsp;Gopalpura&nbsp;Bypass,&nbsp;Jaipur</p><p>&nbsp;📘&nbsp;<strong>Mode:</strong>&nbsp;Offline&nbsp;and&nbsp;Online</p><p></p><p>This&nbsp;workshop&nbsp;focuses&nbsp;on&nbsp;strengthening&nbsp;infection&nbsp;control&nbsp;practices,&nbsp;reducing&nbsp;healthcare-associated&nbsp;infections,&nbsp;and&nbsp;promoting&nbsp;a&nbsp;safe&nbsp;clinical&nbsp;environment&nbsp;through&nbsp;evidence-based&nbsp;training.</p><p></p><p>🔑&nbsp;<strong>Workshop&nbsp;Topics</strong></p><ul><li>Hospital&nbsp;Acquired&nbsp;Infections&nbsp;(HAI)&nbsp;&amp;&nbsp;Biomedical&nbsp;Waste&nbsp;Management</li><li>Hand&nbsp;Hygiene&nbsp;&amp;&nbsp;Personal&nbsp;Protective&nbsp;Equipment&nbsp;(PPE)</li><li>Body&nbsp;Fluid&nbsp;Spill&nbsp;Management</li><li>Needle&nbsp;Stick&nbsp;Injury&nbsp;Management</li></ul><p></p><p>🎯&nbsp;<strong>Who&nbsp;Can&nbsp;Participate?</strong></p><ul><li>ANM&nbsp;Nursing&nbsp;Students</li><li>GNM&nbsp;Students</li><li>B.Sc&nbsp;Nursing&nbsp;Students</li><li>M.Sc&nbsp;Nursing&nbsp;Students</li><li>MBBS&nbsp;Students</li><li>Paramedical&nbsp;Students</li><li>Healthcare&nbsp;Professionals</li><li>Research&nbsp;Scholars&nbsp;(PhD)</li></ul><p></p><p>📜&nbsp;<strong>Certification&nbsp;&amp;&nbsp;Benefits</strong></p><ul><li>Certificate&nbsp;of&nbsp;Participation</li><li>5&nbsp;Credit&nbsp;Hours</li></ul><p></p><p>💰&nbsp;<strong>Registration&nbsp;Fees</strong></p><ul><li>Online&nbsp;Participation:&nbsp;₹200&nbsp;<em>(with&nbsp;coupon&nbsp;code&nbsp;RHS09)</em></li><li>Offline&nbsp;Participation:&nbsp;₹400&nbsp;<em>(with&nbsp;coupon&nbsp;code&nbsp;RHS09)</em></li></ul><p></p><p>📌&nbsp;<strong>Special&nbsp;Offer:</strong>&nbsp;Coupon&nbsp;code&nbsp;<strong>RHS09</strong>&nbsp;is&nbsp;applicable&nbsp;only&nbsp;for&nbsp;the&nbsp;<strong>first&nbsp;500&nbsp;registrations</strong>.</p><p></p><p></p><p>📞&nbsp;<strong>Contact&nbsp;Details</strong></p><p>&nbsp;Call&nbsp;Us:&nbsp;+91-9928907780,&nbsp;+91-9829507781</p><p>&nbsp;E-mail:&nbsp;<a href="mailto:rhhealthcaresimulationcenter@gmail.com" rel="noopener noreferrer" target="_blank">rhhealthcaresimulationcenter@gmail.com</a></p><p></p><p>📍&nbsp;<strong>Venue&nbsp;Address</strong></p><p>&nbsp;RH&nbsp;Healthcare&nbsp;Simulation&nbsp;Center,&nbsp;Triveni&nbsp;Nagar&nbsp;Chouraha,&nbsp;Gopalpura&nbsp;Bypass,&nbsp;Jaipur</p><p></p><p></p><p>All&nbsp;participants&nbsp;must&nbsp;J<strong>oin&nbsp;the&nbsp;WhatsApp&nbsp;group</strong>&nbsp;for&nbsp;further&nbsp;communication&nbsp;and&nbsp;updates.</p><p><a href="https://chat.whatsapp.com/LLmT0ZwQgQyBD8vOgIpGqi?s=cl&amp;p=a&amp;mlu=3" rel="noopener noreferrer" target="_blank">https://chat.whatsapp.com/LLmT0ZwQgQyBD8vOgIpGqi?s=cl&amp;p=a&amp;mlu=3</a></p>',
      start_time: "2026-06-27 09:30:00",
      end_time: "2026-06-27 16:00:00",
      online_price: 300,
      offline_price: 500,
      is_completed: false,
      whatsapp_link: null,
    },
  ];
  return (
    <div className="mx-auto max-w-7xl px-4 py-20">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {workshopData.map((ws) => {
          return (
            <Link
              key={ws.id}
              href={`/course-certificate/${ws.id}`}
              className="group"
            >
              <Card className="flex h-full cursor-pointer flex-col overflow-hidden p-0">
                {/* Image */}
                <div className="relative overflow-hidden bg-gray-200">
                  <Image
                    src={ws.bannerImage}
                    alt={ws.name}
                    width={400}
                    height={400}
                    className="object-contain"
                  />
                </div>

                {/* Content */}
                <div className="flex grow flex-col p-6">
                  <h2 className="group-hover:text-primary mb-2 line-clamp-2 text-xl font-bold text-gray-900 capitalize transition-colors">
                    {ws.name}
                  </h2>

                  {/* Price and Action */}
                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-primary flex items-center gap-2 text-sm font-medium group-hover:underline">
                      View Details <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default page;
