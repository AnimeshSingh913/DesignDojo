import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { errorResponse, normalizeEmail } from '@/lib/http';
import { limitByIp, rateLimit } from '@/lib/rate-limit';
import { OTP_TTL_MS, generateOtp, hashOtp } from '@/lib/otp';
import { siteConfig } from '@/lib/site';

const GENERIC_RESPONSE = { message: 'If an account with that email exists, we sent an OTP to it.' };

export async function POST(req: Request) {
  try {
    const limited = limitByIp(req, 'forgot-password', 5, 15 * 60 * 1000);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const email = normalizeEmail(body.email);

    if (!email) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // At most one OTP email per address per minute (prevents mail-bombing a victim)
    if (!rateLimit(`forgot-password-email:${email}`, 1, 60 * 1000)) {
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    }

    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    }

    const otp = generateOtp();
    user.resetPasswordOtp = hashOtp(otp);
    user.resetPasswordExpires = new Date(Date.now() + OTP_TTL_MS);
    user.resetPasswordAttempts = 0;
    await user.save();

    if (!process.env.SMTP_HOST) {
      console.warn('SMTP_HOST is not configured — password reset email was not sent.');
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || `no-reply@${new URL(siteConfig.url).hostname}`,
      to: user.email,
      subject: `Password Reset OTP - ${siteConfig.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Your One Time Password (OTP) is:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    // Send email asynchronously so the user doesn't have to wait 6-8 seconds
    transporter.sendMail(mailOptions).catch((err) => {
      console.error('Background email sending failed:', err);
    });

    return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
  } catch (error) {
    return errorResponse(error, 'Failed to process request. Please try again later.');
  }
}
