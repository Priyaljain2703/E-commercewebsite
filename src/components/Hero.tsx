import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gray-100">
      <div className="mx-auto grid min-h-[550px] max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2">

        {/* Text */}
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
            New Collection
          </p>

          <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900 md:text-6xl">
            Make Your Home
            <br />
            Feel Like Home.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600">
            Discover beautifully designed furniture made to bring comfort,
            style, and character to every room.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              href="/products"
              className="rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Shop Now
            </Link>

            <Link
              href="/products?category=Sofas"
              className="rounded-full border border-gray-300 bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              Explore Sofas
            </Link>
          </div>
        </div>

        {/* Image */}
        <div className="relative h-[420px] overflow-hidden rounded-3xl bg-gray-200 md:h-[500px]">
          <img
            src="/images/hero.png"
            alt="Modern furniture collection"
            className="h-full w-full object-cover"
          />
        </div>

      </div>
    </section>
  );
}