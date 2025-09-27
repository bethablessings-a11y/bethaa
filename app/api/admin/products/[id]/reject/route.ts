import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    
    const productId = params.id
    const body = await request.json()
    const { reason } = body

    // Update product status to REJECTED
    const product = await prisma.product.update({
      where: { id: productId },
      data: { status: "REJECTED" },
      include: { seller: { include: { user: true } } }
    })

    // TODO: Send email notification to seller with rejection reason
    console.log(`Product rejected: ${product.title} by ${product.seller.user.email}, reason: ${reason}`)

    return NextResponse.json({
      message: "Product rejected successfully",
      product: {
        id: product.id,
        title: product.title,
        status: product.status
      }
    })

  } catch (error) {
    console.error("Product rejection error:", error)
    return NextResponse.json(
      { error: "Failed to reject product" },
      { status: 500 }
    )
  }
}
