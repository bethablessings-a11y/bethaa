import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json()
    
    // Verify webhook signature (PayChangu should provide verification details)
    // const signature = request.headers.get('x-paychangu-signature')
    // Add signature verification here when PayChangu provides details

    const { event, data } = webhookData
    console.log('🔔 PayChangu Webhook Received:', { event, reference: data.reference })

    if (event === 'charge.success') {
      // Payment was successful
      const { reference, amount, currency, customer, metadata } = data
      
      const supabase = await createClient()

      // Update payment status to completed
      const { error: updateError } = await supabase
        .from('coffee_payments')
        .update({ 
          status: 'completed',
          metadata: data,
          updated_at: new Date().toISOString()
        })
        .eq('payment_reference', reference)

      if (updateError) {
        console.error('Error updating payment:', updateError)
        return NextResponse.json(
          { error: 'Failed to update payment' },
          { status: 500 }
        )
      }

      console.log('✅ Payment marked as completed:', reference)

      // Here you could:
      // - Send email notification to the creator
      // - Update creator's balance
      // - Send thank you email to donor

    } else if (event === 'charge.failed') {
      // Payment failed
      const { reference } = data
      
      const supabase = await createClient()
      
      await supabase
        .from('coffee_payments')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('payment_reference', reference)

      console.log('❌ Payment marked as failed:', reference)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}