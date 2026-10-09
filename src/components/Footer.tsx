import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-12 md:grid-cols-4">

          {/* Brand */}
          <div>
            <Link href="/" className="text-2xl font-bold">
              FurniStore
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-6 text-gray-400">
              Beautiful furniture for comfortable and stylish homes.
              Discover pieces you'll love for every room.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold">Shop</h3>

            <div className="mt-5 space-y-3 text-sm text-gray-400">
              <Link
                href="/products"
                className="block hover:text-white"
              >
                All Furniture
              </Link>

              <Link
                href="/products?category=Sofas"
                className="block hover:text-white"
              >
                Sofas
              </Link>

              <Link
                href="/products?category=Chairs"
                className="block hover:text-white"
              >
                Chairs
              </Link>

              <Link
                href="/products?category=Tables"
                className="block hover:text-white"
              >
                Tables
              </Link>

              <Link
                href="/products?category=Beds"
                className="block hover:text-white"
              >
                Beds
              </Link>
            </div>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold">Help</h3>

            <div className="mt-5 space-y-3 text-sm text-gray-400">
              <Link href="#" className="block hover:text-white">
                Contact Us
              </Link>

              <Link href="#" className="block hover:text-white">
                Shipping
              </Link>

              <Link href="#" className="block hover:text-white">
                Returns
              </Link>

              <Link href="#" className="block hover:text-white">
                FAQs
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold">Stay Updated</h3>

            <p className="mt-5 text-sm leading-6 text-gray-400">
              Get updates about new collections and special offers.
            </p>

            <div className="mt-5 flex">
              <input
                type="email"
                placeholder="Your email"
                className="min-w-0 flex-1 rounded-l-lg bg-white px-4 py-3 text-sm text-black outline-none"
              />

              <button
                type="button"
                className="rounded-r-lg bg-gray-700 px-5 text-sm font-semibold hover:bg-gray-600"
              >
                Join
              </button>
            </div>
          </div>

        </div>

        <div className="mt-14 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} FurniStore. All rights reserved.
        </div>

      </div>
    </footer>
  );
}