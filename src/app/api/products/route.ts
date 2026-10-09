import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.is_featured,
        p.is_best_seller,
        p.created_at,
        c.name AS category
      FROM products p
      JOIN categories c
        ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      products: result.rows,
    });
  } catch (error) {
    console.error("Error fetching products:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}