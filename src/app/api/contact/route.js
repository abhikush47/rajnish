import { NextResponse } from 'next/server';
import nodemailer from "nodemailer";
import { addFeedback } from "@/lib/db";

export async function POST(req) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // 1. Save to Database
    const newFeedback = await addFeedback({ name, email, message });

    // 2. Send email via Nodemailer
    try {
      if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: `"Website Contact" <${process.env.GMAIL_USER}>`,
          to: "abhi.kush047@gmail.com",
          subject: "New Message From Rajnish Kushwaha Website",
          html: `
            <h2>New Contact Message</h2>
            <p><b>Name:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Message:</b></p>
            <p>${message}</p>
          `
        });
      } else {
        console.warn("Nodemailer credentials missing in environment variables. Email notification skipped.");
      }
    } catch (mailError) {
      // Log email error, but database transaction succeeded
      console.error("Nodemailer failed to send email notification:", mailError);
    }

    return NextResponse.json({ success: true, data: newFeedback });
  } catch (error) {
    console.error("Error handling contact submission:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}