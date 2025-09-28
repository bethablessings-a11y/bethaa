import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { amount, email, coffeeLinkId, message, currency = 'USD', donorName, paymentMethod, inline = false } = await request.json()

    console.log('💳 Payment request received:', {
      amount,
      email,
      coffeeLinkId,
      currency,
      paymentMethod,
      messageLength: message?.length || 0
    })

    // Validate required fields
    if (!amount || !email || !coffeeLinkId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate amount based on currency
    const maxAmount = currency === 'MWK' ? 2000000 : 1000 // K2M for MWK, $1000 for USD
    const minAmount = currency === 'MWK' ? 1000 : 1 // K1,000 for MWK, $1 for USD
    
    if (amount < minAmount || amount > maxAmount) {
      return NextResponse.json({ 
        error: `Amount must be between ${currency === 'MWK' ? 'K1,000' : '$1'} and ${currency === 'MWK' ? 'K2,000,000' : '$1,000'}` 
      }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Verify coffee link exists
    const { data: coffeeLink, error: linkError } = await supabase
      .from('coffee_links')
      .select('user_id')
      .eq('coffee_link', coffeeLinkId)
      .single()

    if (linkError || !coffeeLink) {
      console.error('❌ Coffee link not found:', coffeeLinkId)
      return NextResponse.json({ error: 'Invalid coffee link' }, { status: 404 })
    }

    console.log('✅ Coffee link found')

    // Generate payment reference
    const paymentReference = `coffee-${coffeeLinkId}-${Date.now()}`

    // ========== PAYCHANGU API INTEGRATION ==========
    // Check if PayChangu secret key is available
    if (!process.env.PAYCHANGU_SECRET_KEY) {
      console.warn('⚠️ PAYCHANGU_SECRET_KEY not set, using test mode')
      
      // Return test checkout URL for development
      const testCheckoutUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?reference=${paymentReference}&amount=${amount}&email=${encodeURIComponent(email)}&test=true`
      
      return NextResponse.json({
        checkout_url: testCheckoutUrl,
        reference: paymentReference,
        test_mode: true
      })
    }

    // Create checkout session using PayChangu API
    const paychanguBody = {
      amount: currency === 'MWK' ? amount.toString() : (amount * 100).toString(),
      currency: currency,
      email: email,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?reference=${paymentReference}`,
      tx_ref: paymentReference,
      customization: {
        title: "Buy Me Coffee",
        description: "Support the creator's work"
      },
      meta: {
        coffee_link_id: coffeeLinkId,
        user_id: coffeeLink.user_id,
        donor_email: email,
        donor_name: donorName,
        donor_message: message,
        type: 'coffee_donation'
      },
      // Enable specific payment methods based on selection
      payment_methods: paymentMethod ? {
        [paymentMethod]: true
      } : {
        mobile_money: true,
        card: true,
        bank_transfer: true
      }
    }

    console.log('🎯 Creating PayChangu checkout session:', paychanguBody)

    try {
      // Call PayChangu API to create checkout session
      const paychanguResponse = await fetch('https://api.paychangu.com/payment', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paychanguBody)
      })

      const paychanguData = await paychanguResponse.json()
      console.log('📥 PayChangu API response:', paychanguData)

      if (!paychanguResponse.ok) {
        console.error('❌ PayChangu API error:', paychanguData)
        throw new Error(paychanguData.message || 'PayChangu API error')
      }

      // Get the checkout URL from PayChangu response
      const paychanguCheckoutUrl = paychanguData.data?.checkout_url || paychanguData.checkout_url
      console.log('🎯 PayChangu checkout URL:', paychanguCheckoutUrl)

      if (!paychanguCheckoutUrl) {
        throw new Error('No checkout URL received from PayChangu')
      }

      // Return the PayChangu URL
      return NextResponse.json({
        checkout_url: paychanguCheckoutUrl,
        reference: paymentReference
      })

    } catch (paychanguError) {
      console.error('❌ PayChangu API error:', paychanguError)
      
      // Fallback to test URL if PayChangu fails
      const testCheckoutUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?reference=${paymentReference}&amount=${amount}&email=${encodeURIComponent(email)}&test=true`
      
      return NextResponse.json({
        checkout_url: testCheckoutUrl,
        reference: paymentReference,
        fallback: true,
        error: paychanguError.message
      })
    }

    // Create payment record in database (with error handling)
    try {
      const { error: paymentError } = await supabase
        .from('coffee_payments')
        .insert({
          payment_reference: paymentReference,
          coffee_link_id: coffeeLinkId,
          amount: amount,
          currency: currency,
          donor_email: email,
          donor_name: donorName,
          donor_message: message,
          status: 'pending'
        })

      if (paymentError) {
        console.error('❌ Error creating payment record:', paymentError)
        // Don't fail the entire request if database insert fails
        console.log('⚠️ Continuing with payment despite database error')
      } else {
        console.log('✅ Payment record created successfully')
      }
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError)
      // Continue with payment even if database is not available
      console.log('⚠️ Continuing with payment despite database connection issues')
    }

  } catch (error) {
    console.error('💥 Payment processing error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}