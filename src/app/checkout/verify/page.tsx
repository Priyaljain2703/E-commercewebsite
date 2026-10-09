"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutVerifyPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSendOtp() {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/checkout/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send OTP.");
        return;
      }

      setOtpSent(true);
      setMessage("OTP sent successfully. Check your email.");
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError("");
    setMessage("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/checkout/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid OTP.");
        return;
      }

      // Save verified email for checkout
      sessionStorage.setItem(
        "checkout_email",
        email.trim().toLowerCase()
      );

      router.push("/checkout");
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Secure Checkout
          </p>

          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Verify Your Email
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            We'll send a verification code to your email before
            continuing to checkout.
          </p>
        </div>

        {/* Email */}
        <div className="mt-8">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            disabled={otpSent}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black disabled:bg-gray-100"
          />
        </div>

        {!otpSent ? (
          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="mt-5 w-full rounded-full bg-black px-6 py-3.5 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        ) : (
          <>
            {/* OTP */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Enter OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value.replace(/\D/g, "")
                  )
                }
                placeholder="Enter 6-digit OTP"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-lg tracking-[0.4em] outline-none transition focus:border-black"
              />
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="mt-5 w-full rounded-full bg-black px-6 py-3.5 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="mt-4 w-full text-sm font-medium text-gray-600 hover:text-black hover:underline"
            >
              Send OTP Again
            </button>
          </>
        )}

        {message && (
          <p className="mt-5 text-center text-sm text-green-600">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-5 text-center text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}