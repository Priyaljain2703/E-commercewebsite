import Link from "next/link";
import ProductCard from "./ProductCard";

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  is_featured: boolean;
  is_best_seller: boolean;
  category: string;
  created_at: string;
};

async function getProducts(): Promise<Product[]> {
  const response = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await response.json();

  return data.products;
}

export default async function NewArrivals() {
  const products = await getProducts();

  const newArrivals = [...products]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .slice(0, 4);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Just In
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              New Arrivals
            </h2>
          </div>

          <Link
            href="/products"
            className="hidden text-sm font-semibold text-gray-900 underline underline-offset-4 sm:block"
          >
            View All →
          </Link>
        </div>

        {/* Products */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

      </div>
    </section>
  );
}