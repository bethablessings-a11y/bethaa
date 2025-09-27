import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { productId } = body

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    if (product.status !== "LIVE") {
      return NextResponse.json(
        { error: "Product not available for purchase" },
        { status: 400 }
      )
    }

    // Check if user already owns this product
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        productId: productId,
        status: "PAID"
      }
    })

    if (existingOrder) {
      return NextResponse.json(
        { error: "You already own this product" },
        { status: 400 }
      )
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        productId: productId,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    })

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        status: "PENDING",
        amount: product.price,
        currency: "USD"
      }
    })

    // TODO: Initialize PayChangu payment
    // For now, return placeholder data
    const paymentData = {
      paymentUrl: `https://paychangu.com/pay/${payment.id}`,
      transactionId: `txn_${Date.now()}`,
      amount: product.price,
      currency: "USD"
    }

    // Update payment with transaction ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: { transactionId: paymentData.transactionId }
    })

    return NextResponse.json({
      orderId: order.id,
      paymentId: payment.id,
      paymentUrl: paymentData.paymentUrl,
      amount: product.price,
      currency: "USD"
    })

  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Helper function to call PayChangu API (to be implemented)
async function initializePayChanguPayment(orderData: any) {
  // TODO: Implement PayChangu API call
  const response = await fetch("https://api.paychangu.com/payments", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: orderData.amount,
      currency: orderData.currency,
      reference: orderData.orderId,
      callback_url: `${process.env.NEXTAUTH_URL}/api/paychangu-webhook`,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/buyer`
    })
  })

  return response.json()
}
