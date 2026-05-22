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

    <h3>SIMTECH – ICU WORKSHOP</h3>
    <p><b>Bridging Knowledge and Critical Care Skills</b></p>

    <p><b>📅 Date:</b> 6 June 2026<br/>
    <b>⏰ Time:</b> 9;30 am to 4 pm</p>

    <h4>Workshop Topics</h4>
    <ul>
      <li>Defibrillator Handling</li>
      <li>Cardiac Monitor Training</li>
      <li>ECG Machine Demonstration</li>
      <li>BiPAP & CPAP Management</li>
      <li>Critical Care Simulation Practice</li>
    </ul>

    <h4>Important Instructions</h4>
    <p>This workshop will be conducted via YouTube Live. The streaming link will be shared on the day of the workshop.</p>

    <p><b>⚠️ Joining our official WhatsApp group is mandatory.</b></p>

    <p>
      👉 <a href="https://chat.whatsapp.com/CyHpNIAepYjItf7W96TqZe">Join WhatsApp Group</a>
    </p>

    <p>We look forward to your participation.</p>

    <p>
    Warm regards,<br/>
    RH Healthcare Simulation Team<br/>
    📞 +91 9928907780<br/>
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