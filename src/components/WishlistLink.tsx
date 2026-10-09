"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWishlistCount } from "@/lib/wishlist";

export default function WishlistLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function updateCount() {
      setCount(getWishlistCount());
    }

    updateCount();

    window.addEventListener("wishlistUpdated", updateCount);

    return () => {
      window.removeEventListener(
        "wishlistUpdated",
        updateCount
      );
    };
  }, []);

  return (
    <Link
      href="/wishlist"
      className="text-sm font-medium text-gray-700 hover:text-black"
    >
      ♡ 
      {count > 0 && ` (${count})`}
    </Link>
  );
}