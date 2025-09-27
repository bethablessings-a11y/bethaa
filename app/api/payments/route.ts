import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { amount, email, coffeeLinkId, userId, message } = await request.json()

    // Validate required fields
    if (!amount || !email || !coffeeLinkId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create payment with PayChangu
    const paychanguResponse = await fetch('https://api.paychangu.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to cents
        currency: 'USD',
        email: email,
        reference: `coffee-${coffeeLinkId}-${Date.now()}`,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
        metadata: {
          coffee_link_id: coffeeLinkId,
          user_id: userId,
          message: message,
          type: 'coffee_donation'
        }
      })
    })

    const paychanguData = await paychanguResponse.json()

    if (!paychanguResponse.ok) {
      console.error('PayChangu API error:', paychanguData)
      return NextResponse.json(
        { error: 'Payment initiation failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      payment_url: paychanguData.data.authorization_url,
      reference: paychanguData.data.reference
    })

  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}