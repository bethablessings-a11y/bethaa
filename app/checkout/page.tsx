"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

interface CheckoutData {
  amount: number
  currency: string
  email: string
  message: string
  coffeeLinkId: string
  creatorName: string
}

export default function CheckoutPage() {
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [checkoutUrl, setCheckoutUrl] = useState<string>("")
  const searchParams = useSearchParams()

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        // Get checkout data from URL parameters
        const amount = parseFloat(searchParams.get('amount') || '5000') // Default K5,000
        const currency = 'MWK' // Always use Malawian Kwacha
        const email = searchParams.get('email') || ''
        const message = searchParams.get('message') || ''
        const coffeeLinkId = searchParams.get('coffeeLinkId') || 'default'
        const creatorName = searchParams.get('creatorName') || 'the creator'

        setCheckoutData({
          amount,
          currency,
          email,
          message,
          coffeeLinkId,
          creatorName
        })

        // Create PayChangu payment session
        await createPaymentSession({
          amount,
          currency,
          email,
          message,
          coffeeLinkId,
          creatorName
        })

      } catch (err) {
        console.error('Checkout initialization error:', err)
        setError('Failed to initialize checkout')
        setLoading(false)
      }
    }

    initializeCheckout()
  }, [searchParams])

  const createPaymentSession = async (data: CheckoutData) => {
    try {
      console.log('💳 Creating PayChangu payment session:', data)

      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          email: data.email,
          message: data.message,
          coffeeLinkId: data.coffeeLinkId,
          creatorName: data.creatorName
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment session')
      }

      console.log('✅ Payment session created:', result)
      setCheckoutUrl(result.checkout_url)
      setLoading(false)

    } catch (error) {
      console.error('❌ Payment session error:', error)
      setError(error instanceof Error ? error.message : 'Failed to create payment session')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-slate-700">
          <div className="text-6xl mb-4">💳</div>
          <h1 className="text-2xl font-bold text-white mb-2">Preparing Checkout</h1>
          <p className="text-slate-300">Setting up your payment...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-slate-700">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Checkout Error</h1>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Complete Your Payment</h1>
              <p className="text-slate-300">Support {checkoutData?.creatorName}'s work</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                K{checkoutData?.amount.toLocaleString()}
              </div>
              <div className="text-slate-400 text-sm">
                Malawian Kwacha
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-2">Payment Methods</h2>
                <p className="text-slate-300 text-sm">
                  Choose your preferred payment method below. All payments are processed securely by PayChangu.
                </p>
              </div>
              
              {checkoutUrl ? (
                <div className="h-[700px]">
                  <iframe
                    src={checkoutUrl}
                    className="w-full h-full border-0"
                    title="PayChangu Checkout"
                    allow="payment"
                  />
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">💳</div>
                  <p className="text-slate-300">Loading payment form...</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Support Amount</span>
                  <span className="text-white font-semibold">
                    K{checkoutData?.amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Creator</span>
                  <span className="text-white">{checkoutData?.creatorName}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Currency</span>
                  <span className="text-white">Malawian Kwacha (MWK)</span>
                </div>
                
                {checkoutData?.message && (
                  <div className="pt-4 border-t border-slate-700">
                    <span className="text-slate-300 text-sm">Your Message:</span>
                    <p className="text-white text-sm mt-1 italic">"{checkoutData.message}"</p>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-slate-700 rounded-lg">
                <h4 className="text-white font-semibold mb-3">Available Payment Methods</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2 p-2 bg-slate-600 rounded-lg">
                    <span className="text-lg">💳</span>
                    <span className="text-slate-200">Cards</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-slate-600 rounded-lg">
                    <span className="text-lg">📱</span>
                    <span className="text-slate-200">Airtel Money</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-slate-600 rounded-lg">
                    <span className="text-lg">📱</span>
                    <span className="text-slate-200">TNM Mpamba</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-slate-600 rounded-lg">
                    <span className="text-lg">🏦</span>
                    <span className="text-slate-200">Bank Transfer</span>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-green-900/30 border border-green-700 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-300 text-xs">
                    <span>🇲🇼</span>
                    <span>Mobile money payments are instant and secure</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="flex items-center justify-center space-x-2 text-slate-400 text-sm">
                  <span>🔒</span>
                  <span>Secured by PayChangu</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-slate-500 text-xs mt-1">
                  <span>🇲🇼</span>
                  <span>Supports Malawian payment methods</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
