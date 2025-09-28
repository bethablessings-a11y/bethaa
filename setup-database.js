#!/usr/bin/env node

/**
 * Database Setup Script for Buy Me Coffee Feature
 * 
 * This script helps you set up the necessary database tables
 * for the Buy Me Coffee feature to work properly.
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  console.log('Please add:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  console.log('🚀 Setting up database tables for Buy Me Coffee feature...')
  
  try {
    // Read the SQL setup file
    const sqlFile = path.join(__dirname, 'supabase-setup.sql')
    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.warn(`⚠️  Statement ${i + 1} had an issue:`, error.message)
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      }
    }
    
    console.log('🎉 Database setup completed!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Start your development server: npm run dev')
    console.log('2. Go to /dashboard/seller')
    console.log('3. Click on "Buy Me Coffee" tab')
    console.log('4. Generate a coffee link and test the payment flow')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    console.log('')
    console.log('Manual setup required:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the contents of supabase-setup.sql')
    console.log('4. Run the SQL script')
  }
}

// Run the setup
setupDatabase()
