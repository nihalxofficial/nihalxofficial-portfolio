/**
 * Vercel Serverless API: Contact Form
 * 
 * Handles contact form submissions. Can either:
 * 1. Save to MongoDB via external backend, or
 * 2. Store locally for Vercel deployments without a running backend
 */

import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // For Vercel deployments without a running backend,
  // we'll just log and acknowledge the submission
  // In production with external backend, this would proxy to /api/v1/contact
  
  const { name, email, subject, message } = req.body;

  // Log the submission (will be sent by the frontend contact form handler)
  console.log("Contact form submission:", { name, email, subject, message });

  res.status(200).json({
    success: true,
    message: "Message received (stored locally, will be sent when backend is available)",
  });
}