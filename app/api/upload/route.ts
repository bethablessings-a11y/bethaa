import { NextRequest, NextResponse } from "next/server"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Allowed file types and their MIME types
const ALLOWED_FILE_TYPES = {
  'application/zip': '.zip',
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'video/mp4': '.mp4',
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3'
}

const MAX_TEASER_SIZE = 50 * 1024 * 1024 // 50MB in bytes

export async function POST(request: NextRequest) {
  try {
    const user = await requireSeller()
    
    const body = await request.json()
    const { fileName, fileType, fileSize, isTeaser = false } = body

    // Validate file type
    if (!ALLOWED_FILE_TYPES[fileType as keyof typeof ALLOWED_FILE_TYPES]) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      )
    }

    // Validate teaser file size
    if (isTeaser && fileSize > MAX_TEASER_SIZE) {
      return NextResponse.json(
        { error: "Teaser file size must be under 50MB" },
        { status: 400 }
      )
    }

    // TODO: Generate presigned URL for S3 or Supabase
    // For now, return a placeholder URL
    const uploadUrl = `https://placeholder-storage.com/upload/${fileName}`
    const fileUrl = `https://placeholder-storage.com/files/${fileName}`

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      message: "Upload URL generated successfully"
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Helper function to validate file checksum (to be implemented)
export async function validateFileChecksum(fileUrl: string, expectedChecksum: string) {
  // TODO: Download file and validate checksum
  return true
}

// Helper function to get file metadata
export async function getFileMetadata(file: File) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  }
}
