
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import Razorpay from "razorpay";
import pool from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json(
        { success: false, message: "Payment configuration is missing" },
        { status: 500 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json();

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      !/^[a-f0-9]{64}$/i.test(razorpay_signature)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid payment details" },
        { status: 400 }
      );
    }

    // Step 1: Verify the signature sent by Razorpay Checkout.
    const expectedSignature = createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest();

    const receivedSignature = Buffer.from(
      razorpay_signature,
      "hex"
    );

    if (
      receivedSignature.length !== expectedSignature.length ||
      !timingSafeEqual(receivedSignature, expectedSignature)
    ) {
      return NextResponse.json(
        { success: false, message: "Payment signature is invalid" },
        { status: 400 }
      );
    }

    // Step 2: Find the payment session saved by our backend.
    const sessionResult = await pool.query(
      `SELECT *
       FROM payment_sessions
       WHERE razorpay_order_id = $1`,
      [razorpay_order_id]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Payment session not found" },
        { status: 404 }
      );
    }

    const session = sessionResult.rows[0];

    // A repeated verification should not create another order.
    if (session.status === "paid" && session.order_id) {
      return NextResponse.json({
        success: true,
        message: "Payment was already verified",
        orderId: session.order_id,
      });
    }

    if (session.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "This payment session is not pending" },
        { status: 409 }
      );
    }

    // Step 3: Confirm the payment with Razorpay's server-side API.
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: secret,
    });

    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured" ||
      payment.amount !==
        Math.round(Number(session.total_amount) * 100) ||
      payment.currency !== "INR"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment is not captured or its details do not match",
        },
        { status: 400 }
      );
    }

    // Step 4: Create the order and mark the payment session paid
    // in one database transaction.
    await client.query("BEGIN");

    const lockedResult = await client.query(
      `SELECT *
       FROM payment_sessions
       WHERE razorpay_order_id = $1
       FOR UPDATE`,
      [razorpay_order_id]
    );

    const lockedSession = lockedResult.rows[0];

    if (!lockedSession) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { success: false, message: "Payment session not found" },
        { status: 404 }
      );
    }

    if (lockedSession.status === "paid" && lockedSession.order_id) {
      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        message: "Payment was already verified",
        orderId: lockedSession.order_id,
      });
    }

    if (lockedSession.status !== "pending") {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { success: false, message: "Payment session is not pending" },
        { status: 409 }
      );
    }

    const orderResult = await client.query(
      `INSERT INTO orders (
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
              'online', 'paid', 'confirmed')
      RETURNING id`,
      [
        lockedSession.email,
        lockedSession.customer_name,
        lockedSession.phone,
        lockedSession.address,
        lockedSession.city,
        lockedSession.state,
        lockedSession.pincode,
        lockedSession.subtotal,
        lockedSession.delivery_charge,
        lockedSession.total_amount,
      ]
    );

    const orderId = orderResult.rows[0].id;

    const savedItems = Array.isArray(lockedSession.items)
      ? lockedSession.items
      : JSON.parse(lockedSession.items);

    for (const item of savedItems) {
      await client.query(
        `INSERT INTO order_items (
          order_id,
          product_id,
          quantity,
          price
        )
        VALUES ($1, $2, $3, $4)`,
        [
          orderId,
          item.productId,
          item.quantity,
          item.price,
        ]
      );
    }

    await client.query(
      `UPDATE payment_sessions
       SET status = 'paid',
           razorpay_payment_id = $1,
           order_id = $2
       WHERE razorpay_order_id = $3`,
      [razorpay_payment_id, orderId, razorpay_order_id]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Payment verified and order created",
      orderId,
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});

    console.error("Payment verification error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to verify payment" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}