"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function PaymentSuccessPage() {
  const [paymentData, setPaymentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const reference = urlParams.get('reference')
      
      if (reference) {
        try {
          // Check payment status in database
          const { data: payment } = await supabase
            .from('coffee_payments')
            .select('*')
            .eq('payment_reference', reference)
            .single()

          setPaymentData(payment || { reference })
        } catch (error) {
          console.error('Error fetching payment data:', error)
          setPaymentData({ reference })
        }
      }
      
      setLoading(false)
    }

    checkPaymentStatus()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-emerald-800 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment</h1>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-emerald-800 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your support! The creator has been notified of your donation.
        </p>
        
        {paymentData && (
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Amount:</span>
                <span className="font-semibold">${paymentData.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Status:</span>
                <span className="font-semibold capitalize">{paymentData.status || 'completed'}</span>
              </div>
              {paymentData.reference && (
                <div className="flex justify-between">
                  <span className="text-green-700">Reference:</span>
                  <span className="font-mono text-xs">{paymentData.reference}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link 
            href="/"
            className="block w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Return Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Support Another Creator
          </button>
        </div>

        <div className="mt-6 text-gray-500 text-sm">
          <p>📧 A receipt has been sent to your email</p>
          <p className="mt-1">⏱️ Please allow 1-2 business days for processing</p>
          <p className="mt-1">🇲🇼 Thank you for supporting Malawian creators!</p>
        </div>
      </div>
    </div>
  )
}