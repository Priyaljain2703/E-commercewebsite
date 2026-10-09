"use client";

import { useEffect, useState } from "react";
import {
  addToWishlist,
  isInWishlist,
  removeFromWishlist,
} from "@/lib/wishlist";

type WishlistButtonProps = {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
};

export default function WishlistButton({
  product,
}: WishlistButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isInWishlist(product.id));
  }, [product.id]);

  function handleWishlist() {
    if (saved) {
      removeFromWishlist(product.id);
      setSaved(false);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image_url: product.image_url,
      });

      setSaved(true);
    }
  }

  return (
    <button
      onClick={handleWishlist}
      className={`w-full rounded-full border px-6 py-4 font-semibold transition ${
        saved
          ? "border-black bg-black text-white"
          : "border-gray-300 bg-white text-gray-900 hover:border-black"
      }`}
    >
      {saved ? "♥ Added to Wishlist" : "♡ Add to Wishlist"}
    </button>
  );
}