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
<p>Dear ${"Participant"},</p>

<p>Greetings from RH Healthcare Simulation Centre.</p>

<p>Thank you for registering for our upcoming workshop:</p>

<h3>🛡️ BIO-SHIELD WORKSHOP 2026</h3>
<p><b>INFECTION CONTROL EXCELLENCE PROGRAM</b></p>
<p><i>"Enhancing Infection Prevention & Patient Safety Through Practical Learning"</i></p>

<p>
Join us for <b>BIO-SHIELD WORKSHOP 2026</b>, a specialized infection control workshop designed to equip healthcare professionals and students with essential knowledge and practical skills in infection prevention, hand hygiene, biomedical waste management, and workplace safety.
</p>

<p>
<b>📅 Date:</b> 27 June 2026<br/>
<b>⏰ Time:</b> 9:30 AM – 4:00 PM<br/>
<b>📍 Venue:</b> RH Healthcare Simulation Center, Triveni Nagar Chouraha, Gopalpura Bypass, Jaipur<br/>
<b>📘 Mode:</b> Offline and Online
</p>

<p>
This workshop focuses on strengthening infection control practices, reducing healthcare-associated infections, and promoting a safe clinical environment through evidence-based training.
</p>

<h4>🔑 Workshop Topics</h4>
<ul>
  <li>Hospital Acquired Infections (HAI) & Biomedical Waste Management</li>
  <li>Hand Hygiene & Personal Protective Equipment (PPE)</li>
  <li>Body Fluid Spill Management</li>
  <li>Needle Stick Injury Management</li>
</ul>

<h4>🎯 Who Can Participate?</h4>
<ul>
  <li>ANM Nursing Students</li>
  <li>GNM Students</li>
  <li>B.Sc Nursing Students</li>
  <li>M.Sc Nursing Students</li>
  <li>MBBS Students</li>
  <li>Paramedical Students</li>
  <li>Healthcare Professionals</li>
  <li>Research Scholars (PhD)</li>
</ul>

<h4>📜 Certification & Benefits</h4>
<ul>
  <li>Certificate of Participation</li>
  <li>5 Credit Hours</li>
</ul>

<h4>Important Instructions</h4>
<p>
All participants must join our official WhatsApp group for further communication, workshop updates, and important announcements.
</p>

<p>
👉 <a href="https://chat.whatsapp.com/LLmT0ZwQgQyBD8vOgIpGqi?s=cl&p=a&mlu=3">https://chat.whatsapp.com/LLmT0ZwQgQyBD8vOgIpGqi?s=cl&p=a&mlu=3</a>
</p>

<p>We look forward to your participation.</p>

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
👉 <a href="https://chat.whatsapp.com/ElsWv1MjOBHBLeYWVEJbg9?s=cl&p=a&mlu=3">
https://chat.whatsapp.com/ElsWv1MjOBHBLeYWVEJbg9?s=cl&p=a&mlu=3
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

export async function sendCoursePurchaseEmail({
    toEmail,
    name,
    courseTitle,
}: {
    toEmail: string;
    name?: string | null;
    courseTitle: string;
}) {
    const html = `
<p>Dear ${name || "Participant"},</p>

<p>Greetings from RH Healthcare Simulation Centre.</p>

<p>Your course purchase has been confirmed successfully.</p>

<h3>${courseTitle}</h3>

<p>
You can now access this course from your RH Healthcare dashboard under <b>My Courses</b>.
</p>

<p>
If you have any questions or need help accessing your course, please contact our team.
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
                Data: "Course Purchase Confirmation - RH Healthcare",
            },
            Body: {
                Html: { Data: html },
            },
        },
    });

    await sesClient.send(command);
}
