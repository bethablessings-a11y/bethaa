"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const [paymentData, setPaymentData] = useState<any>(null)

  useEffect(() => {
    // Check URL parameters for payment reference
    const urlParams = new URLSearchParams(window.location.search)
    const reference = urlParams.get('reference')
    
    if (reference) {
      // You could fetch payment details here
      setPaymentData({ reference })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-emerald-800 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your support! Your payment has been processed successfully.
        </p>
        
        {paymentData && (
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <p className="text-green-800 text-sm">
              Reference: {paymentData.reference}
            </p>
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
            Back to Creator
          </button>
        </div>

        <div className="mt-6 text-gray-500 text-sm">
          <p>You will receive a receipt via email shortly.</p>
        </div>
      </div>
    </div>
  )
}