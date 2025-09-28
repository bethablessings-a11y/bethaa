import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing database constraints...')
    
    const supabase = await createClient()
    
    // Check current constraints
    const { data: constraints, error: constraintError } = await supabase
      .rpc('get_table_constraints', { table_name: 'coffee_links' })
    
    if (constraintError) {
      console.log('ℹ️ Could not check constraints (function might not exist)')
    } else {
      console.log('📋 Current constraints:', constraints)
    }

    // Try to find and handle existing coffee links for the user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    // Check if user has existing coffee links
    const { data: existingLinks, error: linksError } = await supabase
      .from('coffee_links')
      .select('*')
      .eq('user_id', user.id)

    if (linksError) {
      console.error('❌ Error fetching existing links:', linksError)
      return NextResponse.json({ 
        error: 'Database error', 
        details: linksError.message 
      }, { status: 500 })
    }

    console.log('📋 Existing coffee links for user:', existingLinks?.length || 0)

    // If user has multiple links, we can work with that
    // If user has no links, we can create one
    if (!existingLinks || existingLinks.length === 0) {
      // Create a new coffee link
      const newLink = `coffee-${Math.random().toString(36).substring(2, 10)}`
      
      const { data: newLinkData, error: insertError } = await supabase
        .from('coffee_links')
        .insert({
          user_id: user.id,
          coffee_link: newLink,
          title: 'My Coffee Link',
          description: 'Support my work',
          is_active: true
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Error creating coffee link:', insertError)
        return NextResponse.json({ 
          error: 'Failed to create coffee link', 
          details: insertError.message 
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Coffee link created successfully',
        coffee_link: newLinkData
      })
    }

    return NextResponse.json({
      success: true,
      message: 'User already has coffee links',
      coffee_links: existingLinks
    })

  } catch (error) {
    console.error('💥 Database fix error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking database status...')
    
    const supabase = await createClient()
    
    // Check if tables exist
    const { data: linksData, error: linksError } = await supabase
      .from('coffee_links')
      .select('count')
      .limit(1)

    const { data: paymentsData, error: paymentsError } = await supabase
      .from('coffee_payments')
      .select('count')
      .limit(1)

    return NextResponse.json({
      status: 'success',
      tables: {
        coffee_links: linksError ? { error: linksError.message } : { connected: true },
        coffee_payments: paymentsError ? { error: paymentsError.message } : { connected: true }
      },
      message: 'Database status check completed'
    })

  } catch (error) {
    console.error('💥 Database status check error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database status check failed'
    }, { status: 500 })
  }
}
