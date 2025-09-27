"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export default function TestSupabase() {
  const [status, setStatus] = useState<string>("Testing...")

  useEffect(() => {
    const testSupabase = async () => {
      try {
        const supabase = createClient()
        
        // Test 1: Authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        console.log('🔐 Auth test:', { user, authError })
        
        if (authError) {
          setStatus(`Auth Error: ${authError.message}`)
          return
        }

        // Test 2: Database connection with simple query
        const { data, error: dbError } = await supabase
          .from('coffee_links')
          .select('count')
          .limit(1)

        console.log('🗄️ Database test:', { data, dbError })
        
        if (dbError) {
          setStatus(`DB Error: ${dbError.message} (Code: ${dbError.code})`)
          return
        }

        setStatus("✅ Supabase connection successful!")
        
      } catch (error: any) {
        console.error('💥 Unexpected error:', error)
        setStatus(`💥 Unexpected error: ${error.message}`)
      }
    }

    testSupabase()
  }, [])

  return (
    <div className="fixed top-4 right-4 bg-slate-800 text-white p-4 rounded-lg text-sm z-50">
      <div>Supabase Status: {status}</div>
    </div>
  )
}