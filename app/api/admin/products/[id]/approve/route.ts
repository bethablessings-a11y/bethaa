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

    // Update product status to APPROVED
    const product = await prisma.product.update({
      where: { id: productId },
      data: { status: "APPROVED" },
      include: { seller: { include: { user: true } } }
    })

    // TODO: Send email notification to seller
    console.log(`Product approved: ${product.title} by ${product.seller.user.email}`)

    return NextResponse.json({
      message: "Product approved successfully",
      product: {
        id: product.id,
        title: product.title,
        status: product.status
      }
    })

  } catch (error) {
    console.error("Product approval error:", error)
    return NextResponse.json(
      { error: "Failed to approve product" },
      { status: 500 }
    )
  }
}
