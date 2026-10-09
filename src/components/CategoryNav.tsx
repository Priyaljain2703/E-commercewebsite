import Link from "next/link";

const categories = [
  "All Furniture",
  "Sofas",
  "Chairs",
  "Tables",
  "Beds",
  "Wardrobes",
  "Dining",
  "Office",
  "Decor",
];

export default function CategoryNav() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 overflow-x-auto px-6 py-4">
        {categories.map((category) => (
          <Link
            key={category}
            href={
              category === "All Furniture"
                ? "/products"
                : `/products?category=${encodeURIComponent(category)}`
            }
            className="whitespace-nowrap text-sm font-medium text-gray-700 transition hover:text-black"
          >
            {category}
          </Link>
        ))}
      </div>
    </nav>
  );
}