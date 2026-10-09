import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import WishlistButton from "@/components/WishlistButton";

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  is_featured: boolean;
  is_best_seller: boolean;
  category: string;
};

async function getProduct(id: string): Promise<Product | null> {
  const response = await fetch(
    `http://localhost:3000/api/products/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return data.product;
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">

        {/* Back */}
        <Link
          href="/products"
          className="text-sm font-medium text-gray-500 hover:text-black"
        >
          ← Back to Products
        </Link>

        <div className="mt-10 grid gap-12 md:grid-cols-2">

          {/* Product Image */}
          <div className="overflow-hidden rounded-3xl bg-gray-100">
            <img
              src={product.image_url}
              alt={product.name}
              className="aspect-square h-full w-full object-cover"
            />
          </div>

          {/* Product Information */}
          <div className="flex flex-col justify-center">

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              {product.category}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-6 text-2xl font-semibold text-gray-900">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </p>

            <p className="mt-6 max-w-xl leading-7 text-gray-600">
              {product.description}
            </p>

            {product.is_best_seller && (
              <div className="mt-6">
                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800">
                  Best Seller
                </span>
              </div>
            )}
            
            {/* Add to Cart */}
           <AddToCartButton
  product={{
    id: product.id,
    name: product.name,
    price: Number(product.price),
    image_url: product.image_url,
  }}
/>

            {/* Wishlist */}
            <WishlistButton
  product={{
    id: product.id,
    name: product.name,
    price: Number(product.price),
    image_url: product.image_url,
  }}
/>

          </div>
        </div>
      </div>
    </main>
  );
}