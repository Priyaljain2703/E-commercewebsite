"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getWishlist,
  removeFromWishlist,
  WishlistItem,
} from "@/lib/wishlist";
import { addToCart } from "@/lib/cart";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  function loadWishlist() {
    setWishlist(getWishlist());
  }

  useEffect(() => {
    loadWishlist();
  }, []);

  function handleRemove(id: string) {
    removeFromWishlist(id);
    loadWishlist();
  }

  function handleAddToCart(item: WishlistItem) {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
    });

    alert("Added to cart");
  }

  if (wishlist.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="text-5xl">♡</div>

          <h1 className="mt-6 text-4xl font-bold text-gray-900">
            Your Wishlist is Empty
          </h1>

          <p className="mt-4 text-gray-500">
            Save your favorite furniture here and come back to it later.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-block rounded-full bg-black px-7 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Explore Furniture
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Saved Items
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            My Wishlist
          </h1>

          <p className="mt-3 text-gray-500">
            {wishlist.length}{" "}
            {wishlist.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {wishlist.map((item) => (
            <div key={item.id} className="group">
              <Link href={`/products/${item.id}`}>
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>

              <div className="mt-4">
                <Link href={`/products/${item.id}`}>
                  <h2 className="text-lg font-semibold text-gray-900 hover:underline">
                    {item.name}
                  </h2>
                </Link>

                <p className="mt-2 font-semibold text-gray-900">
                  ₹{item.price.toLocaleString("en-IN")}
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 rounded-full bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    Add to Cart
                  </button>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="rounded-full border border-gray-300 px-4 py-3 text-sm font-medium transition hover:border-black"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}