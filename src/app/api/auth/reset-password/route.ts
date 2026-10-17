import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { asString, errorResponse, normalizeEmail } from '@/lib/http';
import { limitByIp } from '@/lib/rate-limit';
import { OTP_MAX_ATTEMPTS, otpMatches } from '@/lib/otp';

const invalid = () => NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });

export async function POST(req: Request) {
  try {
    const limited = limitByIp(req, 'reset-password', 10, 15 * 60 * 1000);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const email = normalizeEmail(body.email);
    const otp = asString(body.otp, 10);
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!email || !otp || !/^\d{6}$/.test(otp) || !newPassword) {
      return NextResponse.json(
        { message: 'Please provide email, a 6-digit OTP, and new password' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8 || newPassword.length > 200) {
      return NextResponse.json(
        { message: 'Password must be between 8 and 200 characters' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({
      email,
      resetPasswordExpires: { $gt: new Date() }, // Ensure OTP has not expired
    }).select('+resetPasswordOtp +resetPasswordExpires +resetPasswordAttempts');

    if (!user || !user.resetPasswordOtp) {
      return invalid();
    }

    // Atomically consume one attempt before checking, so parallel guesses can't exceed the limit
    const reserved = await User.updateOne(
      { _id: user._id, $or: [{ resetPasswordAttempts: { $lt: OTP_MAX_ATTEMPTS } }, { resetPasswordAttempts: { $exists: false } }] },
      { $inc: { resetPasswordAttempts: 1 } }
    );

    if (reserved.modifiedCount === 0) {
      // Too many wrong guesses: burn the OTP so the user must request a new one
      await User.updateOne({ _id: user._id }, { $unset: { resetPasswordOtp: 1, resetPasswordExpires: 1 } });
      return NextResponse.json(
        { message: 'Too many incorrect attempts. Please request a new OTP.' },
        { status: 429 }
      );
    }

    if (!otpMatches(otp, user.resetPasswordOtp)) {
      return invalid();
    }

    // Update user and clear OTP fields
    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordAttempts = 0;
    await user.save();

    return NextResponse.json(
      { message: 'Password reset successfully. You can now login.' },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error, 'Failed to process request. Please try again later.');
  }
}
