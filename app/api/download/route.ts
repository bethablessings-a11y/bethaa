import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const MAX_DOWNLOADS = 5
const DOWNLOAD_EXPIRY_DAYS = 30

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    // Find the user's paid order for this product
    const order = await prisma.order.findFirst({
      where: {
        userId: user.id,
        productId: productId,
        status: "PAID"
      },
      include: {
        product: true,
        payment: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: "You don't own this product or payment is not completed" },
        { status: 403 }
      )
    }

    // Check if download has expired
    if (order.expiresAt && order.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Download link has expired" },
        { status: 403 }
      )
    }

    // Check download count limit
    if (order.downloadCount >= MAX_DOWNLOADS) {
      return NextResponse.json(
        { error: "Download limit exceeded" },
        { status: 403 }
      )
    }

    // Generate signed download URL
    const downloadUrl = await generateSignedDownloadUrl(order.product.fileUrl)

    // Increment download count
    await prisma.order.update({
      where: { id: order.id },
      data: {
        downloadCount: order.downloadCount + 1
      }
    })

    return NextResponse.json({
      downloadUrl,
      remainingDownloads: MAX_DOWNLOADS - order.downloadCount - 1,
      expiresAt: order.expiresAt
    })

  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Generate signed URL for trailer/preview access (no authentication required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, type } = body

    if (type !== "trailer") {
      return NextResponse.json(
        { error: "Invalid request type" },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { trailerUrl: true, status: true }
    })

    if (!product || product.status !== "LIVE") {
      return NextResponse.json(
        { error: "Product not found or not available" },
        { status: 404 }
      )
    }

    if (!product.trailerUrl) {
      return NextResponse.json(
        { error: "No trailer available for this product" },
        { status: 404 }
      )
    }

    // Generate signed URL for trailer
    const trailerUrl = await generateSignedDownloadUrl(product.trailerUrl, 3600) // 1 hour expiry

    // Update analytics
    await prisma.analytics.upsert({
      where: { productId },
      update: { views: { increment: 1 } },
      create: {
        productId,
        views: 1
      }
    })

    return NextResponse.json({
      trailerUrl,
      expiresIn: 3600 // seconds
    })

  } catch (error) {
    console.error("Trailer access error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Helper function to generate signed download URLs
async function generateSignedDownloadUrl(fileUrl: string, expirySeconds: number = 3600): Promise<string> {
  // TODO: Implement actual signed URL generation for S3 or Supabase
  // For now, return a placeholder URL with expiry timestamp
  const expiry = Date.now() + (expirySeconds * 1000)
  return `${fileUrl}?signed=true&expires=${expiry}`
}

// Helper function for S3 signed URLs (to be implemented)
async function generateS3SignedUrl(bucketName: string, key: string, expirySeconds: number = 3600) {
  // TODO: Use AWS SDK to generate presigned URL
  /*
  const s3 = new AWS.S3()
  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: expirySeconds
  }
  return s3.getSignedUrl('getObject', params)
  */
}

// Helper function for Supabase signed URLs (to be implemented)
async function generateSupabaseSignedUrl(bucketName: string, filePath: string, expirySeconds: number = 3600) {
  // TODO: Use Supabase client to generate signed URL
  /*
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, expirySeconds)
  
  if (error) throw error
  return data.signedUrl
  */
}
