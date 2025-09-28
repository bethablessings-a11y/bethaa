"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

interface CoffeeLink {
  id: string
  user_id: string
  coffee_link: string
  created_at: string
}

export default function CoffeePage({ params }: PageProps) {
  const [coffeeLink, setCoffeeLink] = useState<CoffeeLink | null>(null)
  const [coffeeId, setCoffeeId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [donorEmail, setDonorEmail] = useState("")
  const [donorMessage, setDonorMessage] = useState("")
  const [error, setError] = useState<string>("")
  const [creatorName, setCreatorName] = useState<string>("")
  const [paymentStatus, setPaymentStatus] = useState<string>("")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const supabase = createClient()

  // ========== DEFINE ALL FUNCTIONS FIRST ==========

  const fetchCoffeeLink = async (id: string) => {
    try {
      console.log('🔎 Searching for coffee link:', id)

      const { data: coffeeData, error: coffeeError } = await supabase
        .from('coffee_links')
        .select('*')
        .eq('coffee_link', id)
        .maybeSingle()

      console.log('📋 Coffee link search results:', { coffeeData, coffeeError })

      if (coffeeError) {
        if (coffeeError.code === 'PGRST116') {
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

      setCoffeeLink(coffeeData)
      await fetchCreatorInfo(coffeeData.user_id)
      
    } catch (err) {
      console.error('💥 Unexpected error:', err)
      setError(`Unexpected error: ${err}`)
      setLoading(false)
    }
  }

  const fetchCreatorInfo = async (userId: string) => {
    try {
      console.log('👤 Fetching creator info for user:', userId)
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) {
        console.log('ℹ️ No profiles table or error fetching profile:', profileError)
        setCreatorName('the creator')
      } else if (profileData) {
        setCreatorName(profileData.full_name || profileData.username || 'the creator')
      } else {
        setCreatorName('the creator')
      }

      setLoading(false)
      
    } catch (err) {
      console.error('Error fetching creator info:', err)
      setCreatorName('the creator')
      setLoading(false)
    }
  }

const initiatePayment = async (amount: number) => {
  if (!donorEmail) {
    alert("Please enter your email address")
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(donorEmail)) {
    alert("Please enter a valid email address")
    return
  }

  setPaymentLoading(true)

  try {
    console.log('💳 Initiating PayChangu inline checkout...')

    const paymentData = {
      amount: amount,
      email: donorEmail,
      coffeeLinkId: coffeeId,
      message: donorMessage,
      userId: coffeeLink?.user_id,
      inline: true // Request inline checkout
    }

    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    })

    const data = await response.json()

    console.log('📥 Payment API response:', data)
    console.log('📊 Response status:', response.status)
    console.log('📊 Response ok:', response.ok)

    if (!response.ok) {
      console.error('❌ Payment API error:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        url: response.url
      })
      throw new Error(data.error || data.message || `Payment failed with status: ${response.status}`)
    }

    // Check if we got a valid checkout URL
    if (!data.checkout_url) {
      console.error('❌ No checkout URL received:', {
        data: data,
        hasCheckoutUrl: !!data.checkout_url,
        keys: Object.keys(data)
      })
      throw new Error('No checkout URL received from payment API')
    }

    console.log('✅ Payment initiated successfully!')
    console.log('🔗 Checkout URL:', data.checkout_url)
    console.log('📋 Reference:', data.reference)
    
    // Redirect to dedicated checkout page
    console.log('🔄 Redirecting to checkout page...')
    const checkoutParams = new URLSearchParams({
      amount: amount.toString(),
      currency: 'USD', // You can make this dynamic based on user selection
      email: donorEmail,
      message: donorMessage,
      coffeeLinkId: coffeeId,
      creatorName: creatorName
    })
    
    window.location.href = `/checkout?${checkoutParams.toString()}`

  } catch (error: any) {
    console.error('❌ Payment error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      error: error
    })
    
    const errorMessage = error.message || 'Unknown payment error occurred'
    alert(`Payment failed: ${errorMessage}`)
    setPaymentLoading(false)
  }
}


  // Define handleDonation AFTER initiatePayment
  const handleDonation = async (amount: number) => {
    await initiatePayment(amount)
  }

  // ========== NOW USE EFFECT HOOKS ==========

  useEffect(() => {
    const initialize = async () => {
      try {
        const unwrappedParams = await params
        setCoffeeId(unwrappedParams.id)
        console.log('🔍 Coffee ID from URL:', unwrappedParams.id)
        await fetchCoffeeLink(unwrappedParams.id)
      } catch (err) {
        setError(`Initialization error: ${err}`)
        setLoading(false)
      }
    }
    initialize()
  }, [params])

  // ========== RENDER LOGIC ==========

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

  if (error || !coffeeLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-slate-700">
          <h1 className="text-2xl text-white mb-4">Error</h1>
          <p className="text-slate-300 mb-4">{error || 'Coffee link not found'}</p>
          <div className="text-slate-500 text-sm space-y-1">
            <p>Coffee Link ID: {coffeeId}</p>
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
          <p className="text-slate-300">Support {creatorName}'s work</p>
        </div>

        {/* Donor Information */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-2 text-left">Your Email *</label>
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
            <label className="block text-slate-300 text-sm mb-2 text-left">Message (Optional)</label>
            <textarea 
              value={donorMessage}
              onChange={(e) => setDonorMessage(e.target.value)}
              placeholder="Add an encouraging message for the creator"
              className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 resize-none focus:border-purple-500 focus:outline-none"
              rows={3}
            />
          </div>
        </div>

        {/* Currency Selector */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium">
              USD ($)
            </button>
            <button className="px-4 py-2 bg-slate-600 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-500">
              MWK (K)
            </button>
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
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Preparing Checkout...
              </span>
            ) : (
              <>
                <span className="text-xl mr-2">☕</span>
                Buy a Coffee - $5
                <span className="text-sm opacity-80 ml-2">(≈ K8,500)</span>
              </>
            )}
          </button>
          
          <button 
            onClick={() => handleDonation(10)}
            disabled={paymentLoading || !donorEmail}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
          >
            {paymentLoading ? "Preparing Checkout..." : (
              <>
                <span className="text-xl mr-2">🍕</span>
                Buy Lunch - $10
                <span className="text-sm opacity-80 ml-2">(≈ K17,000)</span>
              </>
            )}
          </button>
          
          <button 
            onClick={() => handleDonation(20)}
            disabled={paymentLoading || !donorEmail}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
          >
            {paymentLoading ? "Preparing Checkout..." : (
              <>
                <span className="text-xl mr-2">🍽️</span>
                Buy Dinner - $20
                <span className="text-sm opacity-80 ml-2">(≈ K34,000)</span>
              </>
            )}
          </button>
          
          {/* Custom Amount */}
          <div className="flex space-x-3">
            <input
              type="number"
              placeholder="Custom amount"
              className="flex-1 p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
              min="1"
              max="1000"
            />
            <button 
              onClick={() => {
                const input = document.querySelector('input[type="number"]') as HTMLInputElement
                const amount = input?.value ? parseInt(input.value) : 0
                if (amount > 0 && amount <= 1000) {
                  handleDonation(amount)
                } else {
                  alert('Please enter an amount between $1 and $1000')
                }
              }}
              disabled={paymentLoading || !donorEmail}
              className="px-6 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              Donate
            </button>
          </div>
        </div>

        {/* Payment Info */}
        <div className="text-slate-400 text-sm space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <span>🔒</span>
            <span>Secure checkout by PayChangu</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-xs">
            <span>💳</span>
            <span>Credit/Debit Cards • Airtel Money • TNM Mpamba • Bank Transfer</span>
          </div>
          <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
            <span>🇲🇼</span>
            <span>Supports Malawian payment methods</span>
          </div>
          <p className="text-xs text-slate-500">You'll be redirected to a secure checkout page with all payment methods</p>
        </div>

        {/* Debug info */}
        <div className="mt-4 p-2 bg-slate-900 rounded text-xs">
          <div className="text-slate-500 font-mono">
            <div>Link ID: {coffeeId}</div>
            <div>Creator: {creatorName}</div>
          </div>
        </div>
      </div>


        {/* Payment Status Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full mx-4">
              <div className="text-6xl mb-4">
                {paymentStatus.includes('successful') ? '🎉' : 
                 paymentStatus.includes('failed') ? '❌' : 
                 paymentStatus.includes('processing') ? '⏳' : '💳'}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Status</h2>
              <p className="text-gray-600 mb-6">{paymentStatus}</p>
              
              {paymentStatus.includes('successful') && (
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="text-green-700 text-sm">
                    Redirecting to success page...
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                {!paymentStatus.includes('successful') && (
                  <button
                    onClick={() => {
                      setShowPaymentModal(false)
                      setPaymentStatus('')
                    }}
                    className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  )
}