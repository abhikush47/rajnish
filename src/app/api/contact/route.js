import nodemailer from "nodemailer";

export async function POST(req) {

  try {

    const { name, email, message } = await req.json();

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

    return Response.json({ success: true });

  } catch (error) {

    console.log(error);

    return Response.json({ success: false });

  }

}