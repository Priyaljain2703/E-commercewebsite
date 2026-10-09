import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const body = await request.json();

    const {
      email,
      customerName,
      phone,
      address,
      city,
      state,
      pincode,
      paymentMethod,
      items,
    } = body;

    // 1. Validate required fields
    if (
      !email ||
      !customerName ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !paymentMethod ||
      !items ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All checkout details are required",
        },
        { status: 400 }
      );
    }

    // 2. Start database transaction
    await client.query("BEGIN");

    // 3. Get actual product prices from database
    const productIds = items.map(
      (item: { productId: string }) => item.productId
    );

    const productsResult = await client.query(
      `
      SELECT id, name, price
      FROM products
      WHERE id = ANY($1::uuid[])
      `,
      [productIds]
    );

    if (productsResult.rows.length !== items.length) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "One or more products were not found",
        },
        { status: 400 }
      );
    }

    // 4. Calculate subtotal using database prices
    let subtotal = 0;

    const orderItems = items.map(
      (item: { productId: string; quantity: number }) => {
        const product = productsResult.rows.find(
          (product) => product.id === item.productId
        );

        const quantity = Number(item.quantity);

        if (!product || !Number.isInteger(quantity) || quantity <= 0) {
          throw new Error("Invalid order item");
        }

        const price = Number(product.price);

        subtotal += price * quantity;

        return {
          productId: product.id,
          quantity,
          price,
        };
      }
    );

    // 5. Calculate delivery charge
    const deliveryCharge = subtotal >= 5000 ? 0 : 199;

    const totalAmount = subtotal + deliveryCharge;

    // 6. Create order
    
    // 6. Create order
    const orderResult = await client.query(
      `
      INSERT INTO orders (
        email,
        customer_name,
        phone,
        address,
        city,
        state,
        pincode,
        subtotal,
        delivery_charge,
        total_amount,
        payment_method,
        payment_status,
        order_status
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13
      )
      RETURNING
        id,
        total_amount,
        payment_method,
        payment_status,
        order_status
      `,
      [
        email.trim().toLowerCase(),
        customerName.trim(),
        phone.trim(),
        address.trim(),
        city.trim(),
        state.trim(),
        pincode.trim(),
        subtotal,
        deliveryCharge,
        totalAmount,
        paymentMethod,
        "pending",   // Payment hasn't been received yet
        "confirmed", // Order has been placed successfully
      ]
    );

    const order = orderResult.rows[0];

    // 7. Insert individual order items
    for (const item of orderItems) {
      await client.query(
        `
        INSERT INTO order_items (
          order_id,
          product_id,
          quantity,
          price
        )
        VALUES ($1, $2, $3, $4)
        `,
        [
          order.id,
          item.productId,
          item.quantity,
          item.price,
        ]
      );
    }

    // 8. Finish transaction
    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}