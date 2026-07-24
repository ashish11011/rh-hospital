import { SES_ACCESS_KEY, SES_SECRET_ACCESS_KEY } from "@/env";
import { SESClient, ListIdentitiesCommand, SendEmailCommand } from "@aws-sdk/client-ses";

export const sesClient = new SESClient({
    region: "ap-south-1",
    credentials: {
        accessKeyId: SES_ACCESS_KEY,
        secretAccessKey: SES_SECRET_ACCESS_KEY,
    },
});

export async function sendWorkshopEmail({
    toEmail,
    // name,
}: {
    toEmail: string;
    // name: string;
}) {
const html = `
<p>Dear Participant,</p>

<p>Greetings from <strong>RH Healthcare Simulation Center</strong>.</p>

<p>
Thank you for registering for our upcoming workshop. We are delighted to have you join us for:
</p>

<h2 style="color:#0b5e2b;margin-bottom:0;">🩺 PULSE 360°</h2>
<h3 style="margin-top:6px;">National Workshop on Advanced Emergency Care</h3>

<p><em>"Learn. Practice. Respond. Save Lives."</em></p>

<p>
PULSE 360° is a hands-on workshop designed to strengthen your emergency care skills through practical training and expert guidance. Whether you're a student or a healthcare professional, this workshop will help you build confidence in handling critical medical emergencies.
</p>

<p>
The workshop will be conducted in <strong>both Online and Offline modes</strong>, allowing participants to join in the way that's most convenient for them.
</p>

<hr/>

<h3>📅 Workshop Details</h3>

<p>
<strong>📅 Date:</strong> 8 August<br/>
<strong>⏰ Time:</strong> 9:00 AM – 4:00 PM<br/>
<strong>📍 Venue:</strong> RH Healthcare Simulation Center, Triveni Choraha, Gopalpura Road, Jaipur, Rajasthan
</p>

<p>
The workshop focuses on developing essential emergency care skills through practical demonstrations and evidence-based learning.
</p>

<h3>🔑 Workshop Topics</h3>

<ul>
  <li>ABG Sampling and Interpretation</li>
  <li>Pressure Injury Assessment and Advanced Wound Dressing</li>
  <li>DVT Assessment, Prevention and Compression Therapy</li>
  <li>Anaphylactic Shock and Emergency Response</li>
</ul>

<h3>🎯 Who Can Participate?</h3>

<ul>
  <li>Nursing Students</li>
  <li>Nursing Faculty</li>
  <li>Medical Students</li>
  <li>PhD Scholars</li>
</ul>

<h3>📜 Certification & Benefits</h3>

<ul>
  <li>5 CNE Credit Hours</li>
</ul>

<h3>📢 Important Instructions</h3>

<p>
Please join our official WhatsApp group to receive workshop updates, important announcements, and further communication.
</p>

<p>
👉 <a href="https://chat.whatsapp.com/CJ7NRqWx1RL9SCJfuv3x3Q">
Join the Official WhatsApp Group
</a>
</p>

<p>
We look forward to welcoming you to <strong>PULSE 360°</strong> and hope you have a valuable learning experience.
</p>

<br/>

<p>
Warm Regards,<br/><br/>

<strong>RH Healthcare Simulation Center</strong><br/>

📞 +91 9928907780<br/>
📧 rhhealthcaresimulationcenter@gmail.com<br/>
🌐 https://www.rhhealthcaresimulation.com
</p>
`;

    const command = new SendEmailCommand({
        Source: "no-reply@rhhealthcaresimulation.com",
        Destination: {
            ToAddresses: [toEmail],
        },
        Message: {
            Subject: {
                Data: "Workshop Registration Confirmation - RH Healthcare",
            },
            Body: {
                Html: { Data: html },
            },
        },
    });

    await sesClient.send(command);
}

export async function sendSeminarEmail({
    toEmail,
    // name,
}: {
    toEmail: string;
    // name: string;
}) {
    const html = `
      <p>Dear ${"Participant"},</p>

<p>Greetings from RH Healthcare Simulation Centre.</p> 

<h3>Global Nursing Leadership & Education Summit 2026</h3>

<p>
<b>"A Step Towards Excellence, A Vision for the Future of Nursing"</b>
</p>

<h4>Important Instructions :</h4>

<p>
All participants must join our official WhatsApp group for further communication, summit updates, and important announcements.
</p>

<p>
👉 <a href="https://chat.whatsapp.com/GCEWIjqS8exIn6z2UeZKZ4">
https://chat.whatsapp.com/GCEWIjqS8exIn6z2UeZKZ4
</a>
</p>



<p>
We are delighted to confirm your registration for this prestigious event organized by
<b>RH Healthcare Pvt. Ltd.</b> in collaboration with the
<b>Nursing Teachers Association of India (NTAI)</b>.
</p>

<p>
<b>📅 Date:</b> 5th & 6th September 2026 (Saturday & Sunday)<br/>
<b>📍 Venue:</b> Rajasthan International Centre (RIC), Jhalana Doongri, Jaipur, Rajasthan<br/>
<b>📘 Mode:</b> Offline & Online<br/>
<b>🎓 Credit Hours:</b>
5 CNE Credit Hours for attending 1 day of the summit<br />
10 CNE Credit Hours for attending both days of the summit
</p>

</p>


<h4>📢 Important Instructions</h4>

<p>
All registered participants must join our official WhatsApp group to receive event updates,
schedules, announcements, and important communication regarding the summit.
</p>


<p>
Warm regards,<br/>
RH Healthcare Simulation Team<br/>
📞 +91 9928907780, +91 9829507781<br/>
📧 connect.rhhealth@gmail.com<br/>
🌐 www.rhhealthcaresimulation.com
</p>
`;

    const command = new SendEmailCommand({
        Source: "no-reply@rhhealthcaresimulation.com",
        Destination: {
            ToAddresses: [toEmail],
        },
        Message: {
            Subject: {
                Data: "Seminar Registration Confirmation - RH Healthcare",
            },
            Body: {
                Html: { Data: html },
            },
        },
    });

    await sesClient.send(command);
}