import Link from "next/link";

const offers = [
  {
    title: "Up to 30% Off",
    description: "Refresh your living room with our selected sofas.",
    category: "Sofas",
  },
  {
    title: "New Arrivals",
    description: "Discover our latest furniture collection.",
    category: "All Furniture",
  },
  {
    title: "Dining Collection",
    description: "Create memorable moments around your dining table.",
    category: "Dining",
  },
];

export default function OfferSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Shop & Save
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Offers Made for Your Home
          </h2>
        </div>

        {/* Offers */}
        <div className="grid gap-6 md:grid-cols-3">
          {offers.map((offer) => (
            <div
              key={offer.title}
              className="rounded-2xl bg-gray-100 p-8 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Special Offer
              </p>

              <h3 className="mt-3 text-2xl font-bold text-gray-900">
                {offer.title}
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                {offer.description}
              </p>

              <Link
                href={
                  offer.category === "All Furniture"
                    ? "/products"
                    : `/products?category=${encodeURIComponent(
                        offer.category
                      )}`
                }
                className="mt-6 inline-block text-sm font-semibold text-gray-900 underline underline-offset-4"
              >
                Shop Now →
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}