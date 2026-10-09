"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";

type AddToCartButtonProps = {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
};

export default function AddToCartButton({
  product,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
    });

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  }

  return (
    <button
      onClick={handleAddToCart}
      className="w-full rounded-full bg-black px-6 py-4 font-semibold text-white transition hover:bg-gray-800"
    >
      {added ? "✓ Added to Cart" : "Add to Cart"}
    </button>
  );
}