import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword, generateOTP } from '@/lib/auth';
import { sendOTPEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const hashedPassword = await hashPassword(password);

    // Remove these comments to start registration ------------------------------------------------------------
    // const user = new User({
    //   email: email.toLowerCase(),
    //   password: hashedPassword,
    //   otp: hashedOTP,
    //   otpExpires,
    //   isVerified: false
    // });

    // await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    return NextResponse.json(
      {
        message:
          "User registered successfully. Please check your email for verification code.",
        // userId: user._id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
