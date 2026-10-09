"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import { useSearchParams } from "next/navigation";
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  
  const [category, setCategory] = useState("All Furniture");
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(
  searchParams.get("search") || ""
);
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        setProducts(data.products);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
   const searchTerm = search.toLowerCase().trim();

const matchesSearch =
  product.name.toLowerCase().includes(searchTerm) ||
  product.description.toLowerCase().includes(searchTerm);

    const matchesCategory =
      category === "All Furniture" ||
      product.category.toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-white">
 <Navbar />
      {/* Header */}
      <section className=" bg-gray-50 py-14">
       
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Our Collection
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            All Furniture
          </h1>

          <p className="mt-4 max-w-5xl text-gray-600">
            Explore our collection of furniture designed to make your home
            comfortable, stylish, and beautiful.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search furniture..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-full border border-gray-300 px-5 py-3 outline-none transition focus:border-black"
          />
        </div>

        {/* Categories */}
        <div className="mb-10 flex gap-3 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${
                category === item
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Result count */}
        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filteredProducts.length} products
          </p>

          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-sm font-medium underline underline-offset-4"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Products */}
        {loading ? (
          <div className="py-20 text-center text-gray-500">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              No products found
            </h2>

            <p className="mt-2 text-gray-500">
              Try a different search or category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}