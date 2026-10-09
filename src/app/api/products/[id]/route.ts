import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
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
      WHERE p.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching product:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}