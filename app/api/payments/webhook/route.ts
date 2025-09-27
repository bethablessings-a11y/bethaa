import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json()
    
    // Verify webhook signature (PayChangu should provide this)
    // const signature = request.headers.get('x-paychangu-signature')
    // Verify signature here...

    const { event, data } = webhookData

    if (event === 'charge.success') {
      // Payment was successful
      const { reference, amount, metadata } = data
      
      const supabase = createClient()

      // Record the successful payment in your database
      const { error } = await supabase
        .from('coffee_payments')
        .insert({
          payment_reference: reference,
          amount: amount / 100, // Convert back to dollars
          coffee_link_id: metadata.coffee_link_id,
          donor_email: data.customer?.email,
          donor_message: metadata.message,
          status: 'completed',
          metadata: data
        })

      if (error) {
        console.error('Error recording payment:', error)
      }

      // You could also send email notifications here
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}