# 🗄️ Database Setup Guide

## Quick Setup for Buy Me Coffee Feature

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the contents of `supabase-setup.sql`**
4. **Run the SQL script**

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run the SQL script
supabase db reset
```

### Option 3: Manual Table Creation

If you prefer to create tables manually, here are the essential tables:

#### 1. Coffee Links Table
```sql
CREATE TABLE coffee_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  coffee_link VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255),
  description TEXT,
  goal_amount DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. Coffee Payments Table
```sql
CREATE TABLE coffee_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_reference VARCHAR(255) UNIQUE NOT NULL,
  coffee_link_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  donor_email VARCHAR(255) NOT NULL,
  donor_name VARCHAR(255),
  donor_message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Environment Variables

Make sure your `.env` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🧪 Testing the Setup

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Go to the seller dashboard:**
   - Navigate to `/dashboard/seller`
   - Click on "Buy Me Coffee" tab
   - Generate a coffee link

3. **Test the payment flow:**
   - Visit the generated coffee link
   - Try making a test payment
   - Check if you're redirected to PayChangu

## 🐛 Troubleshooting

### Common Issues:

1. **"Failed to create payment record"**
   - Make sure the database tables exist
   - Check your Supabase connection
   - Verify RLS policies are set correctly

2. **"Coffee link not found"**
   - Ensure the coffee_links table exists
   - Check if the coffee link was created successfully
   - Verify the coffee_link field is unique

3. **PayChangu redirect not working**
   - Check your NEXT_PUBLIC_APP_URL environment variable
   - Ensure PayChangu credentials are correct
   - Check browser console for errors

### Debug Steps:

1. **Check browser console** for JavaScript errors
2. **Check server logs** for API errors
3. **Verify Supabase connection** in the dashboard
4. **Test database queries** directly in Supabase SQL editor

## 🚀 Production Setup

For production deployment:

1. **Set up production Supabase project**
2. **Update environment variables**
3. **Run the SQL setup script**
4. **Configure PayChangu production credentials**
5. **Test the complete payment flow**

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure database tables are created correctly
4. Test with a simple coffee link generation first

---

*This setup guide will get your Buy Me Coffee feature working perfectly!*
