
"use client";

import { useState } from "react";

type PaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type Props = {
  amount: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  onSuccess: (payment: PaymentResponse) => Promise<void>;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (
        event: string,
        callback: (response: {
          error?: { description?: string };
        }) => void
      ) => void;
    };
  }
}

export default function RazorpayCheckoutButton({
  amount,
  customerName,
  email,
  phone,
  address,
  city,
  state,
  pincode,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment() {
    setLoading(true);
    setError("");

    try {
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("Unable to load Razorpay Checkout."));
          document.body.appendChild(script);
        });
      }

      const cart = JSON.parse(
        localStorage.getItem("furnistore_cart") || "[]"
      );

      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          customerName,
          phone,
          address,
          city,
          state,
          pincode,
          items: cart.map(
            (item: { id: string; quantity: number }) => ({
              productId: item.id,
              quantity: item.quantity,
            })
          ),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to start payment.");
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout did not load.");
      }

      const checkout = new window.Razorpay({
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "FurniStore",
        description: "Furniture purchase",
        order_id: data.order.id,
        prefill: {
          name: customerName,
          email:email,
          contact: phone,
        },
        theme: { color: "#171717" },
        handler: async (paymentResponse: PaymentResponse) => {
          try {
            await onSuccess(paymentResponse);
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "Payment verification failed."
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      checkout.on("payment.failed", (failure) => {
        setError(
          failure.error?.description || "Payment failed. Please try again."
        );
        setLoading(false);
      });

      checkout.open();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to start payment."
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className="w-full rounded-full bg-black px-6 py-4 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        {loading
          ? "Opening payment..."
          : `Pay ₹${amount.toLocaleString("en-IN")} Online`}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}