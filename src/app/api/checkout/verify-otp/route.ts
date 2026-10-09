import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and OTP are required",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `
      SELECT *
      FROM checkout_otps
      WHERE email = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP not found. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    const otpRecord = result.rows[0];

    // Check whether OTP has expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      await pool.query(
        `
        DELETE FROM checkout_otps
        WHERE id = $1
        `,
        [otpRecord.id]
      );

      return NextResponse.json(
        {
          success: false,
          message: "OTP has expired. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    // Check OTP
    const isValid = await bcrypt.compare(
      otp.toString(),
      otpRecord.otp_hash
    );

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP",
        },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    await pool.query(
      `
      UPDATE checkout_otps
      SET verified = TRUE
      WHERE id = $1
      `,
      [otpRecord.id]
    );

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify checkout OTP error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify OTP",
      },
      { status: 500 }
    );
  }
}