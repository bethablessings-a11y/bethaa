import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.email) {
    return null
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
    include: {
      seller: true,
    },
  })

  return dbUser
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }
  
  return user
}

export async function requireSeller() {
  const user = await requireAuth()
  
  if (user.role !== "SELLER" && user.role !== "ADMIN") {
    throw new Error("Seller access required")
  }
  
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  
  if (user.role !== "ADMIN") {
    throw new Error("Admin access required")
  }
  
  return user
}
