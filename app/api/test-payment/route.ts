import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing payment API...')
    
    // Test environment variables
    const envCheck = {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      PAYCHANGU_SECRET_KEY: process.env.PAYCHANGU_SECRET_KEY ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
    }

    console.log('📋 Environment check:', envCheck)

    return NextResponse.json({
      status: 'success',
      message: 'Payment API test completed',
      environment: envCheck,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('💥 Payment API test error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Payment API test failed'
    }, { status: 500 })
  }
}