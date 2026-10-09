import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import pool from "@/lib/db";
import { sendEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash OTP before storing it
    const otpHash = await bcrypt.hash(otp, 10);

    // OTP expires after 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Remove previous OTPs for this email
    await pool.query(
      `
      DELETE FROM checkout_otps
      WHERE email = $1
      `,
      [normalizedEmail]
    );

    // Save new OTP
    await pool.query(
      `
      INSERT INTO checkout_otps
      (
        email,
        otp_hash,
        expires_at
      )
      VALUES ($1, $2, $3)
      `,
      [normalizedEmail, otpHash, expiresAt]
    );


      await sendEmail({
        to: normalizedEmail,
        subject: "Your FurniStore Checkout OTP",
        text: `Your OTP is ${otp}. It expires in 5 minutes.`,
      });
    

    console.log("Checkout OTP:", otp);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send checkout OTP error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send OTP",
      },
      { status: 500 }
    );
  }
}