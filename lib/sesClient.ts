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
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />
    <meta name="x-apple-disable-message-reformatting" />

    <title>RH Healthcare</title>

    <style>
      html,
      body {
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      table,
      td {
        border-collapse: collapse;
      }

      table {
        border-spacing: 0;
      }

      img {
        display: block;
        max-width: 100%;
        height: auto;
        border: 0;
      }

      a {
        text-decoration: none;
      }

      @media only screen and (max-width: 600px) {
        .email-wrapper {
          padding: 16px 8px !important;
        }

        .email-container {
          width: 100% !important;
          max-width: 100% !important;
        }

        .header {
          padding: 18px 16px !important;
        }

        .hero-section {
          padding: 32px 20px 16px !important;
        }

        .hero-title {
          font-size: 24px !important;
          line-height: 1.2 !important;
        }

        .title-highlight {
          width: 220px !important;
          max-width: 85% !important;
        }

        .content-section {
          padding: 16px 22px 4px !important;
        }

        .details-section {
          padding: 22px 22px 8px !important;
        }

        .credit-section {
          padding: 14px 22px 0 !important;
        }

        .cta-section {
          padding: 22px 22px 30px !important;
        }

        .footer-section {
          padding: 22px !important;
        }

        .detail-label,
        .detail-value {
          display: block !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .detail-label {
          padding: 14px 16px 5px !important;
        }

        .detail-value {
          padding: 0 16px 14px !important;
          line-height: 1.5 !important;
        }

        .mobile-button {
          display: block !important;
          width: 100% !important;
          box-sizing: border-box !important;
          text-align: center !important;
        }
      }
    </style>
  </head>

  <body
    style="
      width: 100%;
      margin: 0;
      padding: 0;
      background-color: #f6f8f7;
      color: #1f2933;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    "
  >
    <!-- Email preheader -->
    <div
      style="
        display: none;
        max-height: 0;
        max-width: 0;
        overflow: hidden;
        opacity: 0;
        color: transparent;
        font-size: 1px;
        line-height: 1px;
      "
    >
      Your summit registration is confirmed.
    </div>

    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      class="email-wrapper"
      style="
        width: 100%;
        margin: 0;
        padding: 32px 14px;
        background-color: #f6f8f7;
      "
    >
      <tr>
        <td align="center">
          <!--[if mso]>
          <table role="presentation" width="660" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
          <![endif]-->

          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            class="email-container"
            style="
              width: 100%;
              max-width: 660px;
              margin: 0 auto;
              background-color: #ffffff;
              border: 1px solid #edf1ee;
            "
          >
            <!-- Header -->
            <tr>
              <td
                align="center"
                class="header"
                style="
                  padding: 22px 24px;
                  background-color: #123f2a;
                "
              >
                <p
                  style="
                    margin: 0;
                    color: #ffffff;
                    font-size: 18px;
                    line-height: 1.4;
                    font-weight: 700;
                    letter-spacing: 0.2px;
                  "
                >
                  RH Healthcare
                </p>
              </td>
            </tr>

            <!-- Hero -->
            <tr>
              <td
                align="center"
                class="hero-section"
                style="padding: 42px 36px 20px"
              >
                <h1
                  class="hero-title"
                  style="
                    margin: 8px 0 0;
                    color: #0b0f0d;
                    font-size: 28px;
                    line-height: 1.12;
                    font-weight: 800;
                  "
                >
                  Registration Confirmed
                </h1>

                <div
                  class="title-highlight"
                  style="
                    width: 260px;
                    height: 6px;
                    margin: -5px auto 0;
                    background-color: #b8f05a;
                    font-size: 0;
                    line-height: 0;
                  "
                >
                  &nbsp;
                </div>

                <p
                  style="
                    margin: 12px 0 0;
                    color: #667085;
                    font-size: 15px;
                    line-height: 1.6;
                  "
                >
                  <em>
                    Global Nursing &amp; Summit 2026
                  </em>
                </p>
              </td>
            </tr>

            <!-- Introduction -->
            <tr>
              <td
                class="content-section"
                style="padding: 18px 52px 4px"
              >
                <p
                  style="
                    margin: 0 0 18px;
                    color: #111827;
                    font-size: 16px;
                    line-height: 1.75;
                  "
                >
                  Hey,
                </p>

                <p
                  style="
                    margin: 0;
                    color: #111827;
                    font-size: 16px;
                    line-height: 1.75;
                  "
                >
                  Your seat is confirmed. We are delighted to confirm your
                  registration for the summit. Please keep the details below
                  handy.
                </p>
              </td>
            </tr>

            <!-- Event details -->
            <tr>
              <td
                class="details-section"
                style="padding: 26px 52px 10px"
              >
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    width: 100%;
                    background-color: #f7fbf8;
                    border: 1px solid #dfeee5;
                  "
                >
                  <tr>
                    <td
                      class="detail-label"
                      width="110"
                      valign="top"
                      style="
                        width: 110px;
                        padding: 16px 18px;
                        color: #667085;
                        font-size: 13px;
                        line-height: 1.4;
                        font-weight: 700;
                        text-transform: uppercase;
                      "
                    >
                      Date
                    </td>

                    <td
                      class="detail-value"
                      valign="top"
                      style="
                        padding: 16px 18px;
                        color: #111827;
                        font-size: 15px;
                        line-height: 1.5;
                        font-weight: 700;
                      "
                    >
                      5th &amp; 6th September 2026
                    </td>
                  </tr>

                  <tr>
                    <td
                      class="detail-label"
                      width="110"
                      valign="top"
                      style="
                        width: 110px;
                        padding: 0 18px 16px;
                        color: #667085;
                        font-size: 13px;
                        line-height: 1.4;
                        font-weight: 700;
                        text-transform: uppercase;
                      "
                    >
                      Mode
                    </td>

                    <td
                      class="detail-value"
                      valign="top"
                      style="
                        padding: 0 18px 16px;
                        color: #111827;
                        font-size: 15px;
                        line-height: 1.5;
                        font-weight: 700;
                      "
                    >
                      Offline &amp; Online
                    </td>
                  </tr>

                  <tr>
                    <td
                      class="detail-label"
                      width="110"
                      valign="top"
                      style="
                        width: 110px;
                        padding: 0 18px 16px;
                        color: #667085;
                        font-size: 13px;
                        line-height: 1.4;
                        font-weight: 700;
                        text-transform: uppercase;
                      "
                    >
                      Venue
                    </td>

                    <td
                      class="detail-value"
                      valign="top"
                      style="
                        padding: 0 18px 16px;
                        color: #111827;
                        font-size: 15px;
                        line-height: 1.5;
                        font-weight: 700;
                        word-break: break-word;
                      "
                    >
                      Rajasthan International Centre (RIC), Jhalana Doongri,
                      Jaipur, Rajasthan
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Credit hours -->
            <tr>
              <td
                class="credit-section"
                style="padding: 16px 52px 0"
              >
                <p
                  style="
                    margin: 0 0 8px;
                    color: #123f2a;
                    font-size: 15px;
                    line-height: 1.5;
                    font-weight: 800;
                  "
                >
                  Credit Hours
                </p>

                <p
                  style="
                    margin: 0;
                    color: #667085;
                    font-size: 14px;
                    line-height: 1.7;
                  "
                >
                  5 CNE Credit Hours for attending 1 day<br />
                  10 CNE Credit Hours for attending both days
                </p>
              </td>
            </tr>

            <!-- WhatsApp CTA -->
            <tr>
              <td
                align="center"
                class="cta-section"
                style="padding: 24px 52px 34px"
              >
                <p
                  style="
                    margin: 0 0 18px;
                    color: #111827;
                    font-size: 15px;
                    line-height: 1.7;
                  "
                >
                  Please join the WhatsApp group for updates and important
                  announcements.
                </p>

                <a
                  href="https://chat.whatsapp.com/GCEWIjqS8exIn6z2UeZKZ4"
                  target="_blank"
                  class="mobile-button"
                  style="
                    display: inline-block;
                    padding: 14px 24px;
                    background-color: #15803d;
                    color: #ffffff;
                    font-size: 16px;
                    line-height: 1.3;
                    font-weight: 700;
                    text-align: center;
                    text-decoration: none;
                  "
                >
                  Join WhatsApp Group
                </a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                class="footer-section"
                style="
                  padding: 24px 52px 30px;
                  border-top: 1px solid #e5e7eb;
                  color: #667085;
                  font-size: 13px;
                  line-height: 1.7;
                  word-break: break-word;
                "
              >
                Warm regards,<br />

                <strong style="color: #123f2a">
                  RH Healthcare Simulation Team
                </strong>
                <br />

                <a
                  href="tel:+919928907780"
                  style="color: #667085; text-decoration: none"
                >
                  +91 9928907780
                </a>,
                <a
                  href="tel:+919829507781"
                  style="color: #667085; text-decoration: none"
                >
                  +91 9829507781
                </a>
                <br />

                <a
                  href="mailto:rhhealthcaresimulationcenter@gmail.com"
                  style="
                    color: #15803d;
                    text-decoration: none;
                    word-break: break-all;
                  "
                >
                  rhhealthcaresimulationcenter@gmail.com
                </a>
              </td>
            </tr>

            <!-- Bottom accent -->
            <tr>
              <td
                style="
                  height: 8px;
                  background-color: #15803d;
                  font-size: 0;
                  line-height: 0;
                "
              >
                &nbsp;
              </td>
            </tr>
          </table>

          <!--[if mso]>
              </td>
            </tr>
          </table>
          <![endif]-->
        </td>
      </tr>
    </table>
  </body>
</html>
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