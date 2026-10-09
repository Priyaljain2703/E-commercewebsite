"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CartItem,
  getCart,
  getCartTotal,
  removeFromCart,
  updateCartQuantity,
} from "@/lib/cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  function loadCart() {
    const items = getCart();

    setCart(items);
    setTotal(getCartTotal());
  }

  useEffect(() => {
    loadCart();
  }, []);

  function handleQuantityChange(id: string, quantity: number) {
    updateCartQuantity(id, quantity);
    loadCart();
  }

  function handleRemove(id: string) {
    removeFromCart(id);
    loadCart();
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Your Cart is Empty
          </h1>

          <p className="mt-4 text-gray-500">
            Looks like you haven't added anything to your cart yet.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-block rounded-full bg-black px-7 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900">
          Shopping Cart
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-5 lg:col-span-2">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-5 rounded-2xl bg-white p-5 shadow-sm"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-32 w-32 rounded-xl object-cover"
                />

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {item.name}
                    </h2>

                    <p className="mt-2 text-gray-600">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    {/* Quantity */}
                    <div className="flex items-center rounded-full border border-gray-300">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            item.quantity - 1
                          )
                        }
                        className="px-4 py-2 text-lg"
                      >
                        −
                      </button>

                      <span className="px-3">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            item.quantity + 1
                          )
                        }
                        className="px-4 py-2 text-lg"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Item total */}
                <div className="text-right font-semibold">
                  ₹
                  {(item.price * item.quantity).toLocaleString(
                    "en-IN"
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">
              Order Summary
            </h2>

            <div className="mt-6 flex justify-between text-gray-600">
              <span>Subtotal</span>

              <span>
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="mt-4 flex justify-between text-gray-600">
              <span>Delivery</span>
              <span>Free</span>
            </div>

            <div className="my-6 border-t" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>

              <span>
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>

           <Link
  href="/checkout/verify"
  className="mt-8 block w-full rounded-full bg-black px-6 py-4 text-center font-semibold text-white transition hover:bg-gray-800"
>
  Proceed to Checkout
</Link>
          </div>
        </div>
      </div>
    </main>
  );
}