"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

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
  const [paymentStatus, setPaymentStatus] = useState<string>("")
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        // Get checkout data from URL parameters
        const amount = parseFloat(searchParams.get('amount') || '0')
        const currency = searchParams.get('currency') || 'USD'
        const email = searchParams.get('email') || ''
        const message = searchParams.get('message') || ''
        const coffeeLinkId = searchParams.get('coffeeLinkId') || ''
        const creatorName = searchParams.get('creatorName') || 'the creator'

        if (!amount || !email || !coffeeLinkId) {
          setError('Missing required checkout information')
          setLoading(false)
          return
        }

        setCheckoutData({
          amount,
          currency,
          email,
          message,
          coffeeLinkId,
          creatorName
        })

        // Create PayChangu checkout session
        await createCheckoutSession({
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

  const createCheckoutSession = async (data: CheckoutData) => {
    try {
      console.log('💳 Creating PayChangu checkout session:', data)

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: data.amount,
          email: data.email,
          coffeeLinkId: data.coffeeLinkId,
          message: data.message,
          currency: data.currency,
          inline: true
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session')
      }

      console.log('✅ Checkout session created:', result)
      setCheckoutUrl(result.checkout_url)
      setLoading(false)

    } catch (error) {
      console.error('❌ Checkout session error:', error)
      setError(error instanceof Error ? error.message : 'Failed to create checkout session')
      setLoading(false)
    }
  }

  const handlePaymentComplete = (event: MessageEvent) => {
    // Listen for PayChangu payment completion messages
    if (event.origin !== 'https://checkout.paychangu.com' && event.origin !== 'https://test-checkout.paychangu.com') {
      return
    }

    console.log('📨 PayChangu message received:', event.data)

    if (event.data.type === 'payment_completed') {
      console.log('✅ Payment completed!')
      setPaymentStatus('Payment successful! Thank you for your support!')
      
      // Redirect to success page
      setTimeout(() => {
        window.location.href = `/payment/success?reference=${event.data.reference}`
      }, 2000)
    } else if (event.data.type === 'payment_failed') {
      console.log('❌ Payment failed')
      setPaymentStatus('Payment failed. Please try again.')
    }
  }

  useEffect(() => {
    window.addEventListener('message', handlePaymentComplete)
    return () => window.removeEventListener('message', handlePaymentComplete)
  }, [])

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

  if (paymentStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-slate-700">
          <div className="text-6xl mb-4">
            {paymentStatus.includes('successful') ? '🎉' : '❌'}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Status</h1>
          <p className="text-slate-300 mb-6">{paymentStatus}</p>
          {paymentStatus.includes('successful') && (
            <p className="text-slate-400 text-sm">Redirecting to success page...</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Complete Your Payment</h1>
              <p className="text-slate-300">Support {checkoutData?.creatorName}'s work</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                {checkoutData?.currency === 'MWK' ? `K${checkoutData?.amount.toLocaleString()}` : `$${checkoutData?.amount}`}
              </div>
              <div className="text-slate-400 text-sm">
                {checkoutData?.currency === 'MWK' ? 'Malawian Kwacha' : 'US Dollar'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
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
                    {checkoutData?.currency === 'MWK' ? `K${checkoutData?.amount.toLocaleString()}` : `$${checkoutData?.amount}`}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Creator</span>
                  <span className="text-white">{checkoutData?.creatorName}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Currency</span>
                  <span className="text-white">{checkoutData?.currency}</span>
                </div>
                
                {checkoutData?.message && (
                  <div className="pt-4 border-t border-slate-700">
                    <span className="text-slate-300 text-sm">Your Message:</span>
                    <p className="text-white text-sm mt-1 italic">"{checkoutData.message}"</p>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-slate-700 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Available Payment Methods</h4>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-center space-x-2">
                    <span>💳</span>
                    <span>Credit/Debit Cards</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📱</span>
                    <span>Airtel Money</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📱</span>
                    <span>TNM Mpamba</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🏦</span>
                    <span>Bank Transfer</span>
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
