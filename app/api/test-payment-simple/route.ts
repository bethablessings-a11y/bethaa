import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing simple payment API...')
    
    const body = await request.json()
    console.log('📥 Request body:', body)
    
    // Test basic validation
    const { amount, email, coffeeLinkId } = body
    
    if (!amount || !email || !coffeeLinkId) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        received: { amount, email, coffeeLinkId }
      }, { status: 400 })
    }
    
    // Test environment variables
    const envCheck = {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      PAYCHANGU_SECRET_KEY: process.env.PAYCHANGU_SECRET_KEY ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'
    }
    
    console.log('📋 Environment check:', envCheck)
    
    // Return test response
    return NextResponse.json({
      success: true,
      message: 'Simple payment test successful',
      received: body,
      environment: envCheck,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('💥 Simple payment test error:', error)
    return NextResponse.json({
      error: 'Simple payment test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
