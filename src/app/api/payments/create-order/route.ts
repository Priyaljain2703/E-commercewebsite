
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import pool from "@/lib/db";

export const runtime = "nodejs";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, message: "Payment configuration is missing" },
        { status: 500 }
      );
    }

    const body = await request.json();

    const {
      email,
      customerName,
      phone,
      address,
      city,
      state,
      pincode,
      items,
    } = body;

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof customerName !== "string" ||
      !customerName.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof address !== "string" ||
      !address.trim() ||
      typeof city !== "string" ||
      !city.trim() ||
      typeof state !== "string" ||
      !state.trim() ||
      typeof pincode !== "string" ||
      !pincode.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Please provide valid checkout details" },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 100 ||
      items.some(
        (item: { productId?: unknown; quantity?: unknown }) =>
          typeof item.productId !== "string" ||
          !UUID_REGEX.test(item.productId) ||
          !Number.isInteger(item.quantity) ||
          (item.quantity as number) < 1 ||
          (item.quantity as number) > 100
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid cart items" },
        { status: 400 }
      );
    }

    // Confirm that this email completed OTP verification.
    const otpResult = await pool.query(
      `SELECT id
       FROM checkout_otps
       WHERE LOWER(email) = LOWER($1)
         AND verified = TRUE
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [email.trim()]
    );

    if (otpResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please verify your email with OTP again.",
        },
        { status: 403 }
      );
    }

    // Combine repeated product IDs and calculate prices on the server.
    const quantities = new Map<string, number>();

    for (const item of items) {
      const productId = item.productId as string;
      const quantity = item.quantity as number;

      const updatedQuantity =
        (quantities.get(productId) ?? 0) + quantity;

      if (updatedQuantity > 100) {
        return NextResponse.json(
          { success: false, message: "Maximum quantity per product is 100" },
          { status: 400 }
        );
      }

      quantities.set(productId, updatedQuantity);
    }

    const productIds = [...quantities.keys()];

    const productsResult = await pool.query(
      `SELECT id, price
       FROM products
       WHERE id = ANY($1::uuid[])`,
      [productIds]
    );

    if (productsResult.rows.length !== productIds.length) {
      return NextResponse.json(
        { success: false, message: "One or more products were not found" },
        { status: 400 }
      );
    }

    const savedItems = productsResult.rows.map((product) => {
      const pricePaise = Math.round(Number(product.price) * 100);

      return {
        productId: product.id,
        quantity: quantities.get(product.id)!,
        price: pricePaise / 100,
        pricePaise,
      };
    });

    const subtotalPaise = savedItems.reduce(
      (sum, item) => sum + item.pricePaise * item.quantity,
      0
    );

    const deliveryPaise = subtotalPaise >= 500000 ? 0 : 19900;
    const totalPaise = subtotalPaise + deliveryPaise;

    if (!Number.isSafeInteger(totalPaise) || totalPaise <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid payment amount" },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: totalPaise,
      currency: "INR",
      receipt: `cart_${Date.now()}`,
    });

    // Save the checkout details and price snapshot for later verification.
    await pool.query(
      `INSERT INTO payment_sessions (
        razorpay_order_id,
        email,
        customer_name,
        phone,
        address,
        city,
        state,
        pincode,
        items,
        subtotal,
        delivery_charge,
        total_amount,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, 'pending')`,
      [
        razorpayOrder.id,
        email.trim().toLowerCase(),
        customerName.trim(),
        phone.trim(),
        address.trim(),
        city.trim(),
        state.trim(),
        pincode.trim(),
        JSON.stringify(
          savedItems.map(({ productId, quantity, price }) => ({
            productId,
            quantity,
            price,
          }))
        ),
        subtotalPaise / 100,
        deliveryPaise / 100,
        totalPaise / 100,
      ]
    );

    return NextResponse.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      keyId,
    });
  } catch (error) {
    console.error("Razorpay create-order error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to start payment" },
      { status: 500 }
    );
  }
}