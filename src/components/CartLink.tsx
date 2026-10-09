"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCartCount } from "@/lib/cart";

export default function CartLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function updateCount() {
      setCount(getCartCount());
    }

    updateCount();

    window.addEventListener("cartUpdated", updateCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCount);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="text-sm font-medium text-gray-700 hover:text-black"
    >
      🛒 Cart
      {count > 0 && ` (${count})`}
    </Link>
  );
}