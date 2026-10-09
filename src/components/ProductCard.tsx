import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group">
      {/* Image */}
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Product information */}
      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {product.category}
        </p>

        <Link href={`/products/${product.id}`}>
          <h3 className="mt-1 text-lg font-semibold text-gray-900 hover:underline">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 text-base font-semibold text-gray-900">
          ₹{Number(product.price).toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );
}