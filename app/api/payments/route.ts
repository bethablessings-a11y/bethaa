import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { amount, email, coffeeLinkId, message } = await request.json()

    console.log('💳 Payment request received:', {
      amount,
      email,
      coffeeLinkId,
      messageLength: message?.length || 0
    })

    // Validate required fields
    if (!amount || !email || !coffeeLinkId) {
      console.error('❌ Missing required fields:', { amount, email, coffeeLinkId })
      return NextResponse.json(
        { error: 'Missing required fields: amount, email, coffeeLinkId' },
        { status: 400 }
      )
    }

    // Validate amount
    if (amount < 1 || amount > 1000) {
      console.error('❌ Invalid amount:', amount)
      return NextResponse.json(
        { error: 'Amount must be between $1 and $1000' },
        { status: 400 }
      )
    }

    // Get coffee link details from database
    const supabase = await createClient()
    
    console.log('🔍 Searching for coffee link:', coffeeLinkId)
    
    const { data: coffeeLink, error: linkError } = await supabase
      .from('coffee_links')
      .select('user_id')
      .eq('coffee_link', coffeeLinkId)
      .single()

    console.log('📋 Coffee link query results:', { coffeeLink, linkError })

    if (linkError) {
      console.error('❌ Coffee link query error:', {
        code: linkError.code,
        message: linkError.message,
        details: linkError.details
      })
      
      if (linkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Coffee link not found in database' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: `Database error: ${linkError.message}` },
        { status: 500 }
      )
    }

    if (!coffeeLink) {
      console.error('❌ No coffee link found for ID:', coffeeLinkId)
      return NextResponse.json(
        { error: 'Invalid coffee link' },
        { status: 404 }
      )
    }

    console.log('✅ Coffee link found:', coffeeLink)

    // For now, let's simulate a successful payment response
    // Remove this when you have real PayChangu credentials
    const simulatedResponse = {
      payment_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?simulated=true&amount=${amount}`,
      reference: `simulated-${Date.now()}`,
      simulated: true
    }

    console.log('🎯 Returning simulated response:', simulatedResponse)

    return NextResponse.json(simulatedResponse)

    /* 
    // UNCOMMENT THIS WHEN YOU HAVE PAYCHANGU CREDENTIALS:
    
    // Create payment with PayChangu
    const paychanguResponse = await fetch('https://api.paychangu.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'USD',
        email: email,
        reference: `coffee-${coffeeLinkId}-${Date.now()}`,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        metadata: {
          coffee_link_id: coffeeLinkId,
          user_id: coffeeLink.user_id,
          donor_email: email,
          donor_message: message,
          type: 'coffee_donation'
        }
      })
    })

    const paychanguData = await paychanguResponse.json()

    if (!paychanguResponse.ok) {
      console.error('PayChangu API error:', paychanguData)
      return NextResponse.json(
        { error: paychanguData.message || 'Payment initiation failed' },
        { status: 500 }
      )
    }

    // Store payment record in database (pending status)
    const { error: dbError } = await supabase
      .from('coffee_payments')
      .insert({
        payment_reference: paychanguData.data.reference,
        coffee_link_id: coffeeLinkId,
        amount: amount,
        donor_email: email,
        donor_message: message,
        status: 'pending',
        metadata: paychanguData.data
      })

    if (dbError) {
      console.error('Database error:', dbError)
      // Continue anyway - the payment was initiated successfully
    }

    return NextResponse.json({
      payment_url: paychanguData.data.authorization_url,
      reference: paychanguData.data.reference
    })
    */

  } catch (error) {
    console.error('💥 Payment processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}