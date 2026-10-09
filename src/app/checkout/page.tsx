
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  getCart,
  getCartTotal,
  type CartItem,
} from "@/lib/cart";

import RazorpayCheckoutButton from "@/components/RazorpayCheckoutButton";

type CompletedOrder = {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
};

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [email, setEmail] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [completedOrder, setCompletedOrder] =
    useState<CompletedOrder | null>(null);

  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Load verified email and cart.
  useEffect(() => {
    const savedEmail = sessionStorage.getItem("checkout_email");

    if (!savedEmail) {
      router.replace("/checkout/verify");
      return;
    }

    setEmail(savedEmail);

    const loadCart = () => {
      setCart(getCart());
    };

    loadCart();

    window.addEventListener("cartUpdated", loadCart);

    return () => {
      window.removeEventListener("cartUpdated", loadCart);
    };
  }, [router]);

  // Calculate prices using the current cart state.
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const delivery = subtotal >= 5000 ? 0 : 199;
  const total = subtotal + delivery;

  // Clear the cart only after an order is confirmed.
  // Keep the order details in state for the success screen.
  
function showOrderSuccess(
  orderId: string,
  method: string
) {
  console.log("Order confirmed:", orderId);

  setCompletedOrder({
    id: orderId,
    items: [...cart],
    total,
    paymentMethod: method,
  });

  localStorage.removeItem("furnistore_cart");
  window.dispatchEvent(new Event("cartUpdated"));
  setCart([]);
}



  // Place a Cash on Delivery order.
  async function handlePlaceOrder() {
    if (
      !name.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim()
    ) {
      alert("Please fill in all delivery details.");
      return;
    }

    if (cart.length === 0) {
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          customerName: name,
          phone,
          address,
          city,
          state,
          pincode,
          paymentMethod: "cod",
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      console.log("COD API response:", data);

if (!response.ok || !data.success) {
  alert(data.message || "Failed to place order.");
  return;
}

const orderId = data.order?.id;

if (!orderId) {
  console.error("Order ID missing from API response:", data);
  alert("Order was created, but the order ID was not returned.");
  return;
}

// This sets completedOrder and triggers the success screen.
showOrderSuccess(orderId,"cod");
    } catch (error) {
      console.error("COD order error:", error);

      alert("Something went wrong while placing your order.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Verify Razorpay payment and show the same success screen.
  async function handleOnlinePaymentSuccess(payment: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payment),
      });

      const data = await response.json();

      if (!response.ok || !data.orderId) {
        alert(
          data.message ||
            "Payment verification failed. Please contact support before trying to pay again."
        );

        return;
      }

      showOrderSuccess(data.orderId,"Online Payment");
    } catch (error) {
      console.error("Payment verification error:", error);

      alert(
        "We could not confirm your payment. Please check your order status before attempting another payment."
      );
    }
  }

  // IMPORTANT: Show order success before checking whether the cart is empty.
  if (completedOrder) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm sm:p-10">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
              ✓
            </div>

            <h1 className="mt-5 text-3xl font-bold text-gray-900">
              Order Placed Successfully!
            </h1>

            <p className="mt-3 text-gray-600">
              Thank you for shopping with us.
            </p>

            <p className="mt-4 text-gray-600">
              Your order has been placed. Your order ID is:
            </p>

            <p className="mt-3 break-all rounded-xl bg-gray-50 p-4 text-sm font-semibold">
              {completedOrder.id}
            </p>

            <p className="mt-3 font-semibold">
              Payment Method:{" "}
              {completedOrder.paymentMethod === "cod"
                ? "Cash on Delivery"
                : "Online Payment"}
            </p>
          </div>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-bold">Items Ordered</h2>

            <div className="mt-5 space-y-4">
              {completedOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-20 w-20 rounded-xl object-cover"
                  />

                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>

                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    ₹
                    {(item.price * item.quantity).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between border-t pt-5 text-lg font-bold">
              <span>Total</span>

              <span>
                ₹{completedOrder.total.toLocaleString("en-IN")}
              </span>
            </div>

            {completedOrder.paymentMethod === "cod" && (
              <p className="mt-3 text-sm text-gray-600">
                Please pay when your furniture is delivered.
              </p>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/products"
              className="inline-block rounded-full bg-black px-8 py-3 font-semibold text-white hover:bg-gray-800"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // If the user opens checkout with no items, show the empty-cart screen.
  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            Your cart is empty
          </h1>

          <p className="mt-3 text-gray-500">
            Add some furniture before proceeding to checkout.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-block rounded-full bg-black px-6 py-3 font-semibold text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  // Normal checkout page.
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Secure Checkout
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            Complete Your Order
          </h1>

          <p className="mt-2 text-gray-500">
            Verified email: {email}
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          {/* LEFT SIDE */}
          <div className="space-y-8">
            {/* DELIVERY DETAILS */}
            <section className="rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">
                Delivery Details
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium">
                  Address
                </label>

                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House number, street, area..."
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    City
                  </label>

                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    State
                  </label>

                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Pincode
                  </label>

                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Pincode"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>
            </section>

            {/* PAYMENT */}
            <section className="rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">
                Payment Method
              </h2>

              <div className="mt-6 space-y-4">
                <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-200 p-5">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                  />

                  <div>
                    <p className="font-semibold">Cash on Delivery</p>

                    <p className="mt-1 text-sm text-gray-500">
                      Pay when your furniture is delivered.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-200 p-5">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                  />

                  <div>
                    <p className="font-semibold">Online Payment</p>

                    <p className="mt-1 text-sm text-gray-500">
                      Pay securely using an online payment gateway.
                    </p>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* RIGHT SIDE: ORDER SUMMARY */}
          <aside className="h-fit rounded-3xl bg-white p-8 shadow-sm lg:sticky lg:top-8">
            <h2 className="text-2xl font-bold">Order Summary</h2>

            <div className="mt-6 space-y-5">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-20 w-20 rounded-xl object-cover"
                  />

                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>

                    <p className="mt-1 text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>

                    <p className="mt-1 font-medium">
                      ₹
                      {(item.price * item.quantity).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="my-6 border-t" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>

                <span className="font-medium">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>

                <span className="font-medium">
                  {delivery === 0
                    ? "FREE"
                    : `₹${delivery.toLocaleString("en-IN")}`}
                </span>
              </div>
            </div>

            <div className="my-6 border-t" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>

              <span>
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>

            {paymentMethod === "cod" ? (
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="mt-8 w-full rounded-full bg-black px-6 py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </button>
            ) : (
              <div className="mt-8">
                <RazorpayCheckoutButton
                  amount={total}
                  customerName={name}
                  email={email}
                  phone={phone}
                  address={address}
                  city={city}
                  state={state}
                  pincode={pincode}
                  onSuccess={handleOnlinePaymentSuccess}
                />
              </div>
            )}

            <p className="mt-4 text-center text-xs text-gray-500">
              Your order will be created after confirmation.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
