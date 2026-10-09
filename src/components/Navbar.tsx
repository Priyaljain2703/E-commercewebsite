"use client";

import { useState } from "react";
import Link from "next/link";
import CartLink from "@/components/CartLink";
import WishlistLink from "@/components/WishlistLink";

export default function Navbar() {
  const [search, setSearch] = useState("");

function handleSearch(event: React.FormEvent) {
  event.preventDefault();

  const value = search.trim();

  if (!value) {
    return;
  }

  window.location.href = `/products?search=${encodeURIComponent(value)}`;
}
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">

        <Link href="/" className="text-2xl font-bold tracking-tight">
          FurniStore
        </Link>

        <div className="hidden flex-1 max-w-xl md:block">
          <form
  onSubmit={handleSearch}
  className="hidden flex-1 max-w-xl md:block"
>
  <input
    type="text"
    placeholder="Search furniture..."
    value={search}
    onChange={(event) => setSearch(event.target.value)}
    className="w-full rounded-full border border-gray-300 px-5 py-3 text-sm outline-none transition focus:border-black"
  />
</form>
        </div>

        <div className="flex items-center gap-5">
          <WishlistLink />

          <CartLink />
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Sign Up
          </Link>

        </div>
      </div>
    </header>
  );
}