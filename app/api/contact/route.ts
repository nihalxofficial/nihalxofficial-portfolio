import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and message are required' },
        { status: 400 }
      );
    }

    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

    // Elegant fallback if WEB3FORMS_ACCESS_KEY is missing
    if (!accessKey) {
      console.error('[Contact] WEB3FORMS_ACCESS_KEY is not defined. Triggering fallback.');
      return NextResponse.json(
        {
          success: false,
          fallback: true,
          error: 'Email service not configured. Falling back to local hand-off mode.',
        },
        { status: 200 }
      );
    }

    const web3Payload = {
      access_key: accessKey,
      subject: `${subject || 'New Message'} — from ${name}`,
      from_name: 'nihalxofficial Portfolio',
      name,
      email,
      message: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || 'N/A'}\n\nMessage:\n${message}`,
      // Web3Forms sends an auto-reply to `email` automatically
      botcheck: '',
    };

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(web3Payload),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return NextResponse.json({ success: true });
    } else {
      console.error('[Contact] Web3Forms error:', result);
      return NextResponse.json(
        {
          success: false,
          fallback: true,
          error: result.message || 'Failed to send via Web3Forms.',
        },
        { status: 200 }
      );
    }
  } catch (err: any) {
    console.error('[Contact] Unexpected error:', err?.message || err);
    return NextResponse.json(
      {
        success: false,
        fallback: true,
        error: err?.message || 'Server error. Triggering manual email handler fallback.',
      },
      { status: 200 }
    );
  }
}
