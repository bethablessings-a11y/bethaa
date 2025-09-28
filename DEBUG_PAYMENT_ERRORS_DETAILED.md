# 🐛 Debug Payment API Errors - Detailed Guide

## 🎯 Current Issue
You're getting a payment API error with empty object `{}` in the console. This suggests the API is returning an error but the error details aren't being captured properly.

## 🔍 Enhanced Error Handling

### **1. Improved Error Logging**
The payment API now logs detailed error information:

```javascript
console.error('❌ Payment API error:', {
  status: response.status,
  statusText: response.statusText,
  data: data,
  url: response.url
})
```

### **2. Better Error Messages**
The API now returns more detailed error information:

```javascript
return NextResponse.json({ 
  error: 'Internal server error',
  details: error instanceof Error ? error.message : 'Unknown error',
  timestamp: new Date().toISOString()
}, { status: 500 })
```

## 🧪 Testing Steps

### **Step 1: Test Simple Payment API**
```bash
# Test the simple payment endpoint
curl -X POST http://localhost:3000/api/test-payment-simple \
  -H "Content-Type: application/json" \
  -d '{"amount": 5, "email": "test@example.com", "coffeeLinkId": "test-123"}'
```

### **Step 2: Check Environment Variables**
Visit `/api/test-payment` to check if environment variables are set correctly.

### **Step 3: Test Full Payment Flow**
1. **Start your dev server:** `npm run dev`
2. **Go to seller dashboard:** `/dashboard/seller`
3. **Generate a coffee link:** Click "Buy Me Coffee" tab
4. **Test payment:** Visit the coffee link and try a donation
5. **Check console:** Look for detailed error messages

## 🔧 Common Issues & Solutions

### **Issue 1: Missing Environment Variables**
**Symptoms:** API returns 500 error, empty error object
**Solution:** Check your `.env` file has all required variables:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYCHANGU_SECRET_KEY=your_paychangu_secret_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Issue 2: Database Connection Issues**
**Symptoms:** Coffee link not found, database errors
**Solution:** Run the database setup script:

```sql
-- Run the contents of supabase-setup.sql in your Supabase dashboard
```

### **Issue 3: PayChangu API Issues**
**Symptoms:** PayChangu API errors, no checkout URL
**Solution:** Check PayChangu credentials and API status

### **Issue 4: Missing Coffee Link**
**Symptoms:** "Invalid coffee link" error
**Solution:** Generate a new coffee link or check database

## 🚨 Debugging Checklist

### **1. Check Server Logs**
Look for these error patterns in your terminal:

```
❌ Coffee link not found: [coffeeLinkId]
❌ PayChangu API error: [error details]
❌ Error creating payment record: [database error]
💥 Payment processing error: [unexpected error]
```

### **2. Check Browser Console**
Look for these error patterns in browser console:

```
❌ Payment API error: {status: 500, data: {...}}
❌ No checkout URL received: {data: {...}}
❌ Payment error: {message: "...", stack: "..."}
```

### **3. Check Network Tab**
1. **Open browser DevTools**
2. **Go to Network tab**
3. **Try making a payment**
4. **Check `/api/payments` request and response**

### **4. Test API Endpoints**
```bash
# Test environment
curl -X GET http://localhost:3000/api/test-payment

# Test simple payment
curl -X POST http://localhost:3000/api/test-payment-simple \
  -H "Content-Type: application/json" \
  -d '{"amount": 5, "email": "test@example.com", "coffeeLinkId": "test-123"}'
```

## 🔧 Step-by-Step Debugging

### **Step 1: Check Environment Variables**
```bash
# Check if .env file exists
ls -la .env

# Check environment variables
echo $NEXT_PUBLIC_APP_URL
echo $PAYCHANGU_SECRET_KEY
```

### **Step 2: Test Database Connection**
```bash
# Test database connection
curl -X GET http://localhost:3000/api/fix-database
```

### **Step 3: Test Payment API**
```bash
# Test simple payment API
curl -X POST http://localhost:3000/api/test-payment-simple \
  -H "Content-Type: application/json" \
  -d '{"amount": 5, "email": "test@example.com", "coffeeLinkId": "test-123"}'
```

### **Step 4: Test Full Payment Flow**
1. **Start development server:** `npm run dev`
2. **Go to seller dashboard:** `/dashboard/seller`
3. **Generate coffee link:** Click "Buy Me Coffee" tab
4. **Test payment:** Visit coffee link and try donation
5. **Check console:** Look for detailed error messages

## 📊 Error Response Format

### **Before (Empty Error):**
```javascript
❌ Payment API error: {}
```

### **After (Detailed Error):**
```javascript
❌ Payment API error: {
  status: 500,
  statusText: "Internal Server Error",
  data: {
    error: "Internal server error",
    details: "Specific error message",
    timestamp: "2024-01-01T00:00:00.000Z"
  },
  url: "http://localhost:3000/api/payments"
}
```

## 🚀 Quick Fixes

### **Fix 1: Missing Environment Variables**
```bash
# Add to .env file
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYCHANGU_SECRET_KEY=your_paychangu_secret_key_here
```

### **Fix 2: Database Issues**
```sql
-- Run in Supabase SQL Editor
-- Copy and paste contents of supabase-setup.sql
```

### **Fix 3: PayChangu Issues**
```javascript
// API will automatically use test mode if PayChangu key is missing
// Check if PAYCHANGU_SECRET_KEY is set correctly
```

## 📞 Getting Help

If you're still experiencing issues:

1. **Check server logs** for specific error messages
2. **Test environment variables** with `/api/test-payment`
3. **Test simple payment** with `/api/test-payment-simple`
4. **Verify database setup** with SQL script
5. **Check PayChangu credentials** and API status

---

*This enhanced error handling will help you identify and fix payment API issues quickly with detailed error information.*
