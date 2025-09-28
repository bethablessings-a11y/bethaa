# 🐛 Debug Payment API Errors

## 🎯 Common Issues & Solutions

### **Internal Server Error (500)**

This error typically occurs due to missing environment variables or API integration issues.

#### **1. Check Environment Variables**

First, verify your `.env` file has all required variables:

```env
# Required for PayChangu integration
PAYCHANGU_SECRET_KEY=your_paychangu_secret_key_here

# Required for app URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Required for Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### **2. Test Environment Setup**

Visit `/api/test-payment` to check if environment variables are properly set.

#### **3. Check Server Logs**

Look for these error messages in your terminal:

```
❌ Coffee link not found: [coffeeLinkId]
❌ PayChangu API error: [error details]
❌ Error creating payment record: [database error]
💥 Payment processing error: [unexpected error]
```

### **Missing PayChangu Secret Key**

If `PAYCHANGU_SECRET_KEY` is not set, the API will automatically use test mode:

```javascript
// API will return test checkout URL
{
  checkout_url: "http://localhost:3000/payment/success?reference=...&test=true",
  reference: "coffee-abc123-1234567890",
  test_mode: true
}
```

### **Database Connection Issues**

If Supabase tables don't exist, the API will continue with payment but log warnings:

```
⚠️ Continuing with payment despite database error
⚠️ Continuing with payment despite database connection issues
```

## 🔧 Step-by-Step Debugging

### **Step 1: Check Environment Variables**

```bash
# Check if .env file exists
ls -la .env

# Check environment variables
echo $PAYCHANGU_SECRET_KEY
echo $NEXT_PUBLIC_APP_URL
```

### **Step 2: Test API Endpoint**

```bash
# Test the payment API directly
curl -X GET http://localhost:3000/api/test-payment
```

### **Step 3: Check Database Tables**

Run the SQL script in `supabase-setup.sql` to create necessary tables:

```sql
-- Create coffee_links table
CREATE TABLE IF NOT EXISTS coffee_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  coffee_link VARCHAR(255) UNIQUE NOT NULL,
  -- ... rest of the schema
);
```

### **Step 4: Test Payment Flow**

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Go to seller dashboard:**
   - Navigate to `/dashboard/seller`
   - Click "Buy Me Coffee" tab
   - Generate a coffee link

3. **Test payment:**
   - Visit the generated coffee link
   - Try making a test payment
   - Check browser console for errors

## 🚨 Error Messages & Solutions

### **"Missing required fields"**
- **Cause:** Missing amount, email, or coffeeLinkId
- **Solution:** Ensure all required fields are provided

### **"Invalid coffee link"**
- **Cause:** Coffee link doesn't exist in database
- **Solution:** Generate a new coffee link or check database

### **"PayChangu API error"**
- **Cause:** Invalid PayChangu secret key or API issues
- **Solution:** Check PayChangu credentials and API status

### **"No checkout URL received"**
- **Cause:** PayChangu API didn't return checkout URL
- **Solution:** Check PayChangu API response and credentials

### **"Internal server error"**
- **Cause:** Unexpected error in payment processing
- **Solution:** Check server logs for specific error details

## 🧪 Testing Without PayChangu

If you don't have PayChangu credentials yet, the API will automatically use test mode:

```javascript
// Test mode response
{
  checkout_url: "http://localhost:3000/payment/success?reference=...&test=true",
  reference: "coffee-abc123-1234567890",
  test_mode: true
}
```

This allows you to test the payment flow without real PayChangu integration.

## 📊 Debug Tools

### **Browser Console**
Check for JavaScript errors and API responses:

```javascript
// Look for these messages
💳 Payment request received: {...}
🎯 Creating PayChangu checkout session: {...}
📥 PayChangu API response: {...}
✅ Payment initiated successfully!
```

### **Network Tab**
Monitor API calls and responses:

1. Open browser DevTools
2. Go to Network tab
3. Try making a payment
4. Check `/api/payments` request and response

### **Server Logs**
Check terminal for server-side errors:

```bash
# Look for these patterns
❌ Error: [error message]
⚠️ Warning: [warning message]
✅ Success: [success message]
```

## 🔄 Fallback Behavior

The API has built-in fallbacks for common issues:

1. **Missing PayChangu Key** → Uses test mode
2. **Database Errors** → Continues with payment
3. **PayChangu API Errors** → Falls back to test URL
4. **Network Issues** → Returns error with details

## 📞 Getting Help

If you're still experiencing issues:

1. **Check server logs** for specific error messages
2. **Test environment variables** with `/api/test-payment`
3. **Verify database setup** with SQL script
4. **Check PayChangu credentials** and API status
5. **Test with fallback mode** (no PayChangu key)

---

*This debugging guide will help you identify and fix payment API issues quickly.*
