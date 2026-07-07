import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and message are required' },
        { status: 400 }
      );
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      console.error('[Contact] Gmail credentials not configured.');
      return NextResponse.json(
        { success: false, fallback: true, error: 'Email service not configured.' },
        { status: 200 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    // ── Email 1: Notify admin (you) ──────────────────────────────────────
    await transporter.sendMail({
      from: `"NihalxOfficial" <${gmailUser}>`,
      to: gmailUser,
      replyTo: email,
      subject: `${name} — Portfolio Inquiry`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>New Portfolio Inquiry</title>
        </head>
        <body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

                  <!-- Header Bar -->
                  <tr>
                    <td style="background:#0a1628;border-radius:12px 12px 0 0;padding:32px 36px 28px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p style="margin:0 0 4px;color:#4a9eff;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Portfolio Contact Form</p>
                            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;line-height:1.3;">New Inquiry Received</h1>
                          </td>
                          <td align="right" valign="top">
                            <div style="background:#162033;border:1px solid #1e3a5f;border-radius:8px;padding:8px 14px;display:inline-block;">
                              <p style="margin:0;color:#4a9eff;font-size:12px;font-weight:600;">UNREAD</p>
                            </div>
                          </td>
                        </tr>
                      </table>
                      <div style="margin-top:20px;height:1px;background:linear-gradient(90deg,#1e3a5f,transparent);"></div>
                    </td>
                  </tr>

                  <!-- Sender Profile Block -->
                  <tr>
                    <td style="background:#0d1f38;padding:28px 36px 20px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td valign="middle" style="width:52px;">
                            <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#1e56a0,#4a9eff);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#fff;text-align:center;line-height:48px;">
                              ${name.charAt(0).toUpperCase()}
                            </div>
                          </td>
                          <td valign="middle" style="padding-left:16px;">
                            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">${name}</p>
                            <a href="mailto:${email}" style="color:#4a9eff;font-size:14px;text-decoration:none;">${email}</a>
                          </td>
                          <td align="right" valign="middle">
                            <div style="background:#0a1e35;border:1px solid #1e3a5f;border-radius:20px;padding:6px 14px;">
                              <p style="margin:0;color:#64748b;font-size:12px;">Via Portfolio</p>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Details Table -->
                  <tr>
                    <td style="background:#0d1f38;padding:0 36px 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #1e3a5f;border-radius:10px;overflow:hidden;">
                        <tr style="background:#0a1628;">
                          <td style="padding:12px 18px;border-bottom:1px solid #1e3a5f;width:30%;">
                            <p style="margin:0;color:#4a9eff;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Field</p>
                          </td>
                          <td style="padding:12px 18px;border-bottom:1px solid #1e3a5f;">
                            <p style="margin:0;color:#4a9eff;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Value</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:14px 18px;border-bottom:1px solid #162033;">
                            <p style="margin:0;color:#64748b;font-size:13px;font-weight:600;">Full Name</p>
                          </td>
                          <td style="padding:14px 18px;border-bottom:1px solid #162033;">
                            <p style="margin:0;color:#e2e8f0;font-size:14px;font-weight:600;">${name}</p>
                          </td>
                        </tr>
                        <tr style="background:#0a1628;">
                          <td style="padding:14px 18px;border-bottom:1px solid #162033;">
                            <p style="margin:0;color:#64748b;font-size:13px;font-weight:600;">Email</p>
                          </td>
                          <td style="padding:14px 18px;border-bottom:1px solid #162033;">
                            <a href="mailto:${email}" style="color:#4a9eff;font-size:14px;text-decoration:none;font-weight:600;">${email}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:14px 18px;">
                            <p style="margin:0;color:#64748b;font-size:13px;font-weight:600;">Subject</p>
                          </td>
                          <td style="padding:14px 18px;">
                            <p style="margin:0;color:#e2e8f0;font-size:14px;font-weight:600;">${subject || 'No Subject Provided'}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Message Block -->
                  <tr>
                    <td style="background:#0d1f38;padding:0 36px 28px;">
                      <p style="margin:0 0 10px;color:#64748b;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Message</p>
                      <div style="background:#071020;border:1px solid #1e3a5f;border-left:3px solid #1e56a0;border-radius:8px;padding:20px 22px;">
                        <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.85;white-space:pre-wrap;">${message}</p>
                      </div>
                    </td>
                  </tr>

                  <!-- CTA -->
                  <tr>
                    <td style="background:#0a1628;padding:24px 36px;border-top:1px solid #1e3a5f;border-radius:0 0 12px 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td valign="middle">
                            <p style="margin:0;color:#475569;font-size:13px;">Click to open a direct reply in your mail client.</p>
                          </td>
                          <td align="right" valign="middle">
                            <a href="mailto:${email}?subject=Re%3A ${encodeURIComponent(subject || 'Your Portfolio Message')}" style="display:inline-block;background:#1e56a0;color:#ffffff;text-decoration:none;padding:11px 26px;border-radius:7px;font-size:14px;font-weight:700;letter-spacing:0.3px;">Reply to ${name}</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 0;text-align:center;">
                      <p style="margin:0;color:#94a3b8;font-size:12px;">NihalxOfficial Portfolio &nbsp;·&nbsp; Automated Admin Notification</p>
                      <p style="margin:4px 0 0;color:#475569;font-size:11px;">Do not forward or share this email.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    // ── Email 2: Confirmation reply to the visitor ───────────────────────
    await transporter.sendMail({
      from: `"NihalxOfficial" <${gmailUser}>`,
      to: email,
      subject: `Thanks for reaching out, ${name}! 🙌`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; padding: 40px; border-radius: 12px; border: 1px solid #2a2a3d;">
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #6c63ff, #a78bfa); border-radius: 50%; width: 56px; height: 56px; line-height: 56px; font-size: 26px; color: #fff; margin-bottom: 12px;">✉️</div>
            <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Message Received!</h1>
            <p style="color: #9ca3af; font-size: 14px; margin: 6px 0 0;">Thanks for getting in touch.</p>
          </div>
          <div style="background: #1a1a2e; border-radius: 10px; padding: 24px; margin-bottom: 24px;">
            <p style="color: #d1d5db; font-size: 15px; line-height: 1.7; margin: 0;">
              Hi <strong style="color: #a78bfa;">${name}</strong>,<br/><br/>
              Thank you for reaching out through my portfolio! I've received your message and will get back to you as soon as possible — usually within <strong style="color: #6c63ff;">24–48 hours</strong>.
            </p>
          </div>
          <div style="background: #1a1a2e; border-radius: 10px; padding: 20px; margin-bottom: 24px; border-left: 3px solid #6c63ff;">
            <p style="color: #9ca3af; font-size: 13px; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 1px;">Your message summary</p>
            <p style="color: #e5e7eb; font-size: 14px; margin: 0 0 4px;"><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
            <p style="color: #d1d5db; font-size: 14px; margin: 0; white-space: pre-wrap; line-height: 1.6;">${message.length > 200 ? message.substring(0, 200) + '…' : message}</p>
          </div>
          <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0;">
            In the meantime, feel free to explore my work at my portfolio or connect with me on 
            <a href="https://www.linkedin.com/in/md-nihal-uddin/" style="color: #6c63ff; text-decoration: none;">LinkedIn</a> or 
            <a href="https://github.com/nihalxofficial" style="color: #6c63ff; text-decoration: none;">GitHub</a>.
          </p>
          <hr style="border: none; border-top: 1px solid #2a2a3d; margin: 24px 0;" />
          <p style="color: #4b5563; font-size: 12px; text-align: center; margin: 0;">
            This is an automated confirmation. Please do not reply to this email directly.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Contact] Nodemailer error:', err?.message || err);
    return NextResponse.json(
      { success: false, fallback: true, error: err?.message || 'Failed to send email.' },
      { status: 200 }
    );
  }
}
