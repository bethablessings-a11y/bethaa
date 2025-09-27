"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function CoffeePage({ params }: PageProps) {
  const [coffeeLink, setCoffeeLink] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [donorEmail, setDonorEmail] = useState("")
  const [donorMessage, setDonorMessage] = useState("")
  const [coffeeId, setCoffeeId] = useState<string>("")
  const [debugInfo, setDebugInfo] = useState<string>("")
  const supabase = createClient()

  useEffect(() => {
    const unwrapParams = async () => {
      try {
        const unwrappedParams = await params
        setCoffeeId(unwrappedParams.id)
        setDebugInfo(`URL Parameter: ${unwrappedParams.id}`)
      } catch (error) {
        setDebugInfo(`Error unwrapping params: ${error}`)
      }
    }
    unwrapParams()
  }, [params])

  useEffect(() => {
    if (coffeeId) {
      fetchCoffeeLink()
    }
  }, [coffeeId])

  const fetchCoffeeLink = async () => {
    if (!coffeeId) return
    
    try {
      setDebugInfo(`Searching for coffee link: ${coffeeId}`)
      console.log('🔍 Searching database for coffee link:', coffeeId)

      const { data, error } = await supabase
        .from('coffee_links')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('coffee_link', coffeeId)
        .single()

      console.log('📊 Database query results:', { data, error })
      setDebugInfo(`Query results: ${error ? error.message : 'Found'}`)

      if (error) {
        console.error('❌ Database error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        setLoading(false)
        return
      }

      if (!data) {
        console.log('❌ No coffee link found in database')
        setDebugInfo('No matching coffee link found')
        setLoading(false)
        return
      }

      console.log('✅ Coffee link found:', data)
      setDebugInfo(`Found link for user: ${data.user_id}`)
      setCoffeeLink(data)
      setLoading(false)

    } catch (error) {
      console.error('💥 Unexpected error:', error)
      setDebugInfo(`Unexpected error: ${error}`)
      setLoading(false)
    }
  }

  const initiatePayment = async (amount: number) => {
    if (!donorEmail) {
      alert("Please enter your email address")
      return
    }

    setPaymentLoading(true)

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          email: donorEmail,
          coffeeLinkId: coffeeId,
          message: donorMessage,
          userId: coffeeLink?.user_id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed')
      }

      // Redirect to PayChangu payment page
      window.location.href = data.payment_url

    } catch (error: any) {
      console.error('Payment error:', error)
      alert(`Payment failed: ${error.message}`)
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleDonation = async (amount: number) => {
    await initiatePayment(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-slate-700">
          <div className="text-6xl mb-4">☕</div>
          <p className="text-slate-300">Loading...</p>
          <p className="text-slate-500 text-sm mt-2">ID: {coffeeId}</p>
          <p className="text-slate-500 text-xs mt-1">Debug: {debugInfo}</p>
        </div>
      </div>
    )
  }

  if (!coffeeLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-slate-700">
          <h1 className="text-2xl text-white mb-4">Invalid Coffee Link</h1>
          <p className="text-slate-300 mb-2">This coffee link is invalid or has been removed.</p>
          <div className="text-slate-500 text-sm space-y-1">
            <p>Looking for: {coffeeId}</p>
            <p>Debug: {debugInfo}</p>
            <p>Check browser console for details</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-slate-700">
        {/* Creator Info */}
        <div className="mb-8">
          <div className="text-6xl mb-4">☕</div>
          <h1 className="text-3xl font-bold text-white mb-2">Buy Me Coffee</h1>
          <p className="text-slate-300">
            Support {coffeeLink.profiles?.full_name || 'this creator'}'s work
          </p>
        </div>

        {/* Donor Information */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-2 text-left">
              Your Email *
            </label>
            <input
              type="email"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              placeholder="Enter your email for receipt"
              className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2 text-left">
              Message (Optional)
            </label>
            <textarea 
              value={donorMessage}
              onChange={(e) => setDonorMessage(e.target.value)}
              placeholder="Add an encouraging message"
              className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 resize-none focus:border-purple-500 focus:outline-none"
              rows={3}
            />
          </div>
        </div>

        {/* Donation Options */}
        <div className="space-y-4 mb-6">
          <button 
            onClick={() => handleDonation(5)}
            disabled={paymentLoading || !donorEmail}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
          >
            {paymentLoading ? (
              "Processing..."
            ) : (
              <>
                <span className="text-xl mr-2">☕</span>
                Buy a Coffee - $5
              </>
            )}
          </button>
          
          <button 
            onClick={() => handleDonation(10)}
            disabled={paymentLoading || !donorEmail}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
          >
            {paymentLoading ? (
              "Processing..."
            ) : (
              <>
                <span className="text-xl mr-2">🍕</span>
                Buy Lunch - $10
              </>
            )}
          </button>
          
          <button 
            onClick={() => handleDonation(20)}
            disabled={paymentLoading || !donorEmail}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
          >
            {paymentLoading ? (
              "Processing..."
            ) : (
              <>
                <span className="text-xl mr-2">🍽️</span>
                Buy Dinner - $20
              </>
            )}
          </button>
        </div>

        {/* Security Info */}
        <div className="text-slate-400 text-sm">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span>🔒</span>
            <span>Secure payment by PayChangu</span>
          </div>
          <p className="text-xs">Your support goes directly to the creator</p>
        </div>

        {/* Debug info */}
        <div className="mt-4 p-2 bg-slate-900 rounded text-xs">
          <div className="text-slate-500 font-mono">
            <div>Debug: {debugInfo}</div>
            <div>Link ID: {coffeeId}</div>
          </div>
        </div>
      </div>
    </div>
  )
}