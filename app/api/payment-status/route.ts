import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json({ error: 'Payment reference required' }, { status: 400 })
    }

    console.log('🔍 Checking payment status for reference:', reference)

    const supabase = await createClient()
    
    // Get payment record from database
    const { data: payment, error } = await supabase
      .from('coffee_payments')
      .select('*')
      .eq('payment_reference', reference)
      .single()

    if (error) {
      console.error('❌ Error fetching payment:', error)
      return NextResponse.json({ 
        error: 'Payment not found',
        status: 'not_found'
      }, { status: 404 })
    }

    console.log('📋 Payment found:', {
      reference: payment.payment_reference,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency
    })

    return NextResponse.json({
      reference: payment.payment_reference,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      donor_email: payment.donor_email,
      donor_name: payment.donor_name,
      donor_message: payment.donor_message,
      created_at: payment.created_at,
      updated_at: payment.updated_at
    })

  } catch (error) {
    console.error('💥 Payment status check error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      status: 'error'
    }, { status: 500 })
  }
}
