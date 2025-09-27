"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function CoffeePage({ params }: PageProps) {
  const [coffeeId, setCoffeeId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const supabase = createClient()

  useEffect(() => {
    const initialize = async () => {
      try {
        const unwrappedParams = await params
        setCoffeeId(unwrappedParams.id)
        console.log('🔍 Coffee ID from URL:', unwrappedParams.id)
        
        await testDatabaseConnection(unwrappedParams.id)
      } catch (err) {
        setError(`Initialization error: ${err}`)
        setLoading(false)
      }
    }
    initialize()
  }, [params])

  const testDatabaseConnection = async (id: string) => {
    try {
      console.log('🧪 Testing database connection...')
      
      // Test 1: Basic Supabase connection
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('🔐 Auth test:', { user: !!user, authError })
      
      // Test 2: Simple table access
      const { data: testData, error: testError } = await supabase
        .from('coffee_links')
        .select('id')
        .limit(1)

      console.log('📊 Basic table access:', { testData, testError })
      
      if (testError) {
        setError(`Database error: ${testError.message} (Code: ${testError.code})`)
        setLoading(false)
        return
      }

      // Test 3: Search for the specific coffee link
      console.log('🔎 Searching for coffee link:', id)
      const { data: coffeeData, error: coffeeError } = await supabase
        .from('coffee_links')
        .select('*')
        .eq('coffee_link', id)
        .maybeSingle() // Use maybeSingle instead of single to avoid throwing on no rows

      console.log('📋 Coffee link search results:', { coffeeData, coffeeError })

      if (coffeeError) {
        if (coffeeError.code === 'PGRST116') {
          // No rows found - this is normal if the link doesn't exist
          setError(`No coffee link found with ID: ${id}`)
        } else {
          setError(`Query error: ${coffeeError.message}`)
        }
        setLoading(false)
        return
      }

      if (!coffeeData) {
        setError(`Coffee link not found: ${id}`)
        setLoading(false)
        return
      }

      // Success!
      console.log('✅ Coffee link found:', coffeeData)
      setLoading(false)
      
    } catch (err) {
      console.error('💥 Unexpected error:', err)
      setError(`Unexpected error: ${err}`)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-slate-700">
          <div className="text-6xl mb-4">☕</div>
          <p className="text-slate-300">Loading coffee link...</p>
          <p className="text-slate-500 text-sm mt-2">ID: {coffeeId}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-slate-700">
          <h1 className="text-2xl text-white mb-4">Error</h1>
          <p className="text-slate-300 mb-4">{error}</p>
          <div className="text-slate-500 text-sm space-y-1">
            <p>Coffee Link ID: {coffeeId}</p>
            <p>Check browser console for details</p>
          </div>
        </div>
      </div>
    )
  }

  // Success page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-slate-700">
        <div className="mb-8">
          <div className="text-6xl mb-4">☕</div>
          <h1 className="text-3xl font-bold text-white mb-2">Buy Me Coffee</h1>
          <p className="text-slate-300">Support this creator's work</p>
          <p className="text-slate-500 text-xs mt-2">Link ID: {coffeeId}</p>
        </div>

        <div className="space-y-4 mb-8">
          <button 
            onClick={() => alert('Thank you for your $5 donation!')}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
          >
            <span className="text-xl mr-2">☕</span>
            Buy a Coffee - $5
          </button>
          
          <button 
            onClick={() => alert('Thank you for your $10 donation!')}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-lg"
          >
            <span className="text-xl mr-2">🍕</span>
            Buy Lunch - $10
          </button>
          
          <button 
            onClick={() => alert('Thank you for your $20 donation!')}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
          >
            <span className="text-xl mr-2">🍽️</span>
            Buy Dinner - $20
          </button>
        </div>

        <div className="text-slate-400 text-sm">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span>🔒</span>
            <span>Secure payment</span>
          </div>
        </div>
      </div>
    </div>
  )
}