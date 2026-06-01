import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and message are required' },
        { status: 400 }
      );
    }

    // Elegant fallback if RESEND_API_KEY is completely missing in environment
    if (!process.env.RESEND_API_KEY) {
      console.error("[Contact] RESEND_API_KEY is not defined. Triggering client-side handoff fallback.");
      return NextResponse.json(
        { 
          success: false, 
          fallback: true, 
          error: 'Email dispatch client not configured. Falling back to local hand-off mode.' 
        },
        { status: 200 }
      );
    }

    // Dynamically determine the from email address to support custom verified domains with display name
    const rawFrom = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const fromEmail = `nihalxofficial <${rawFrom}>`;

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Gorgeous Notification Email HTML Template (To you) - Perfect padding and centered layout
    const notificationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Portfolio Message</title>
      </head>
      <body style="margin: 0; padding: 80px 20px; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; min-height: 100vh;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border-radius: 20px; overflow: hidden; border: 1px solid #1f2937; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);">
          <!-- Glowing Top Banner -->
          <div style="height: 6px; background: linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);"></div>
          
          <!-- Header -->
          <div style="padding: 40px 40px 20px 40px; text-align: center;">
            <div style="display: inline-block; padding: 8px 20px; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 100px; margin-bottom: 20px;">
              <span style="font-size: 12px; font-weight: 600; color: #818cf8; letter-spacing: 1px; text-transform: uppercase;">New Inquiry</span>
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Message Received</h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #9ca3af;">A visitor sent a message through your portfolio contact form.</p>
          </div>
          
          <!-- Content Card -->
          <div style="padding: 0 40px 40px 40px;">
            <div style="background-color: #1f2937; border-radius: 16px; padding: 24px; border: 1px solid #374151;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; width: 30%;">Name</td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 500; color: #ffffff;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase;">Email</td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 500; color: #6366f1;"><a href="mailto:${email}" style="color: #818cf8; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase;">Subject</td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 500; color: #ffffff;">${subject || 'N/A'}</td>
                </tr>
              </table>
              
              <div style="margin-top: 24px; border-top: 1px solid #374151; padding-top: 20px;">
                <div style="font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; margin-bottom: 12px;">Message</div>
                <div style="background-color: #111827; border-left: 3px solid #a855f7; border-radius: 4px 8px 8px 4px; padding: 16px 20px; font-size: 14px; line-height: 1.6; color: #e5e7eb; white-space: pre-wrap;">${message}</div>
              </div>
            </div>
            
            <!-- Footer Note -->
            <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #6b7280;">
              <p style="margin: 0;">Sent via <a href="https://nihalxofficial.vercel.app" style="color: #818cf8; text-decoration: none;">nihalxofficial</a> contact portal.</p>
              <p style="margin: 6px 0 0 0;">Reply directly to this email to respond to the visitor.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;


    // 1. Dispatch Notification Email (To Nihal)
    const { data: adminData, error: adminError } = await resend.emails.send({
      from: fromEmail,
      to: ['mdnihaluddinbijoy@gmail.com'],
      replyTo: `${name} <${email}>`,
      subject: `${subject || 'New Message'} — from ${name}`,
      html: notificationHtml
    });

    if (adminError) {
      console.error("[Contact] Resend Admin dispatch error:", JSON.stringify(adminError, null, 2));
      
      // If the primary dispatch fails, trigger graceful local client-side handoff fallback
      return NextResponse.json(
        { 
          success: false, 
          fallback: true, 
          error: adminError.message || 'Failed to dispatch notification email directly.' 
        },
        { status: 200 }
      );
    }

    // Visitor confirmation is handled manually — reply directly from Gmail using the replyTo header above.
    return NextResponse.json({ success: true, id: adminData?.id });
  } catch (err: any) {
    console.error("[Contact] Unexpected system route error:", err?.message || err);
    
    // In case of any unhandled network or parser errors, fallback gracefully rather than returning 500
    return NextResponse.json(
      { 
        success: false, 
        fallback: true, 
        error: err?.message || 'Server error. Triggering manual email handler fallback.' 
      },
      { status: 200 }
    );
  }
}
