import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
  }

  try {
    const { amount, currency, email, message, coffeeLinkId, creatorName } = await request.json()

    console.log('💳 Creating PayChangu payment:', {
      amount,
      currency,
      email,
      coffeeLinkId,
      creatorName
    })

    // Validate required fields
    if (!amount || !email) {
      return NextResponse.json({ error: "Amount and email are required" }, { status: 400 })
    }

    // Check if PayChangu secret key is available
    if (!process.env.PAYCHANGU_SECRET_KEY) {
      console.warn('⚠️ PAYCHANGU_SECRET_KEY not set, using test mode')
      
      // Return test checkout URL for development
      const testCheckoutUrl = `https://test-checkout.paychangu.com/8041532379`
      
      return NextResponse.json({
        checkout_url: testCheckoutUrl,
        test_mode: true
      })
    }

    const response = await fetch("https://api.paychangu.com/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: amount,
        currency: currency || "MWK",
        email: email,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/paychangu-callback`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/payment/success`,
        tx_ref: `coffee-${coffeeLinkId}-${Date.now()}`,
        customization: {
          title: "Buy Me Coffee",
          description: "Support the creator's work"
        },
        meta: {
          coffee_link_id: coffeeLinkId,
          creator_name: creatorName,
          donor_message: message,
          type: 'coffee_donation'
        }
      }),
    })

    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('❌ Non-JSON response from PayChangu:', text.substring(0, 500))
      throw new Error(`PayChangu API returned non-JSON response: ${response.status}`)
    }

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ PayChangu API error:', data)
      return NextResponse.json({ error: data }, { status: 400 })
    }

    console.log('✅ PayChangu payment created:', data)

    return NextResponse.json({ 
      checkout_url: data.data?.checkout_url || data.checkout_url,
      reference: data.data?.reference || data.reference
    })

  } catch (err) {
    console.error('💥 Payment creation error:', err)
    console.error('💥 Error stack:', err instanceof Error ? err.stack : 'No stack trace')
    return NextResponse.json({ 
      error: "Server error",
      details: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    }, { status: 500 })
  }
}
