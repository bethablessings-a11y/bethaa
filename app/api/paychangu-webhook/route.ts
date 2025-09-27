import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paychangu-signature")
    
    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      )
    }

    const webhookData = JSON.parse(body)
    const { event, data } = webhookData

    switch (event) {
      case "payment.success":
        await handlePaymentSuccess(data)
        break
      case "payment.failed":
        await handlePaymentFailed(data)
        break
      default:
        console.log(`Unhandled webhook event: ${event}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(data: any) {
  const { reference, transaction_id, amount } = data

  try {
    // Find the order by reference (orderId)
    const order = await prisma.order.findUnique({
      where: { id: reference },
      include: { payment: true, product: true }
    })

    if (!order) {
      console.error(`Order not found: ${reference}`)
      return
    }

    // Update payment status
    await prisma.payment.update({
      where: { orderId: order.id },
      data: {
        status: "SUCCESS",
        transactionId: transaction_id
      }
    })

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" }
    })

    // Update product analytics
    await prisma.analytics.upsert({
      where: { productId: order.productId },
      update: {
        salesCount: { increment: 1 },
        revenue: { increment: order.product.price }
      },
      create: {
        productId: order.productId,
        salesCount: 1,
        revenue: order.product.price
      }
    })

    console.log(`Payment successful for order: ${order.id}`)

  } catch (error) {
    console.error("Error handling payment success:", error)
  }
}

async function handlePaymentFailed(data: any) {
  const { reference, reason } = data

  try {
    // Find the order by reference (orderId)
    const order = await prisma.order.findUnique({
      where: { id: reference },
      include: { payment: true }
    })

    if (!order) {
      console.error(`Order not found: ${reference}`)
      return
    }

    // Update payment status
    await prisma.payment.update({
      where: { orderId: order.id },
      data: { status: "FAILED" }
    })

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" }
    })

    console.log(`Payment failed for order: ${order.id}, reason: ${reason}`)

  } catch (error) {
    console.error("Error handling payment failure:", error)
  }
}

function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature) return false

  const webhookSecret = process.env.PAYCHANGU_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("PAYCHANGU_WEBHOOK_SECRET not configured")
    return false
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex")

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}
