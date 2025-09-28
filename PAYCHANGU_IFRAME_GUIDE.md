# 💳 PayChangu Iframe Checkout Implementation

## 🎯 Overview
This implementation uses PayChangu's API to create checkout sessions and displays them in an iframe, exactly like your test project. Users stay on your site while processing payments securely.

## ✨ Key Features

### 🔄 **Inline Iframe Checkout**
- **API Integration** - Uses PayChangu API to create checkout sessions
- **Iframe Display** - PayChangu checkout embedded in your page
- **Message Handling** - Listens for payment completion events
- **Seamless UX** - Users never leave your site

### 🛡️ **Security & Reliability**
- **Secure API Calls** - Server-side PayChangu API integration
- **Message Validation** - Validates iframe messages from PayChangu
- **Error Handling** - Comprehensive error states and user feedback
- **Webhook Support** - Real-time payment status updates

### 📱 **User Experience**
- **Modal Display** - Beautiful modal with iframe checkout
- **Close Button** - Easy way to cancel payment
- **Status Updates** - Real-time payment status feedback
- **Mobile Optimized** - Works perfectly on all devices

## 🚀 How It Works

### 1. **Payment Initiation**
```javascript
// User clicks donation button
const paymentData = {
  amount: 5,
  email: 'user@example.com',
  coffeeLinkId: 'coffee-abc123',
  message: 'Keep up the great work!',
  inline: true
}
```

### 2. **API Checkout Creation**
```javascript
// Server calls PayChangu API
const paychanguBody = {
  amount: "500", // in cents for USD
  currency: "USD",
  email: "user@example.com",
  callback_url: "https://yourapp.com/api/payments/webhook",
  return_url: "https://yourapp.com/payment/success",
  tx_ref: "coffee-abc123-1234567890",
  customization: {
    title: "Buy Me Coffee",
    description: "Support the creator's work"
  }
}
```

### 3. **Iframe Display**
```jsx
<iframe
  src={checkoutUrl}
  className="w-full h-full border-0"
  title="PayChangu Checkout"
  allow="payment"
/>
```

### 4. **Message Handling**
```javascript
// Listen for PayChangu iframe messages
window.addEventListener('message', (event) => {
  if (event.data.type === 'payment_completed') {
    // Handle successful payment
  }
})
```

## 🔧 Technical Implementation

### **Frontend (Coffee Page)**
- **Iframe Modal** - Beautiful modal with PayChangu checkout
- **Message Listener** - Handles payment completion events
- **Status Updates** - Real-time payment status feedback
- **Error Handling** - Graceful error states and user feedback

### **Backend (API Routes)**
- **Payment API** - `/api/payments` - Creates PayChangu checkout session
- **Webhook API** - `/api/payments/webhook` - Handles PayChangu callbacks
- **Status API** - `/api/payment-status` - Checks payment status

### **Database Integration**
- **Payment Records** - Stores payment data in `coffee_payments` table
- **Status Tracking** - Real-time status updates via webhooks
- **Analytics** - Comprehensive payment analytics and reporting

## 🎨 User Interface Components

### **Iframe Checkout Modal**
```jsx
{showCheckout && checkoutUrl && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Complete Your Payment</h2>
        <button onClick={() => setShowCheckout(false)}>×</button>
      </div>
      <div className="h-[650px]">
        <iframe
          src={checkoutUrl}
          className="w-full h-full border-0"
          title="PayChangu Checkout"
          allow="payment"
        />
      </div>
    </div>
  </div>
)}
```

### **Payment Status Modal**
```jsx
{showPaymentModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full mx-4">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Status</h2>
      <p className="text-gray-600 mb-6">{paymentStatus}</p>
    </div>
  </div>
)}
```

## 🌍 Malawian Market Features

### **Currency Support**
- **USD/MWK Toggle** - Easy currency switching
- **Exchange Rate Display** - Real-time conversion rates
- **Local Pricing** - Appropriate amounts for Malawian market

### **Payment Methods**
- **Airtel Money** - Mobile money integration
- **TNM Mpamba** - Local mobile payments
- **Bank Transfer** - Direct bank payments
- **Credit Cards** - International and local cards

### **Localization**
- **Malawian Flag** - 🇲🇼 Branding throughout
- **Local Messaging** - Culturally appropriate language
- **Mobile Optimization** - Perfect for mobile-first market

## 🔧 Setup Instructions

### **1. Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYCHANGU_SECRET_KEY=your_paychangu_secret_key_here
```

### **2. Database Tables**
Run the SQL script in `supabase-setup.sql` to create necessary tables.

### **3. PayChangu Configuration**
Ensure your PayChangu secret key is properly configured in your environment.

### **4. Test the Flow**
1. Start your development server
2. Go to `/dashboard/seller`
3. Generate a coffee link
4. Test the payment flow

## 🐛 Troubleshooting

### **Common Issues**

#### **Iframe Not Loading**
```javascript
// Check if checkout URL is valid
console.log('Checkout URL:', checkoutUrl)
```

#### **Message Events Not Working**
```javascript
// Verify message origin
if (event.origin !== 'https://checkout.paychangu.com') {
  return
}
```

#### **API Errors**
```javascript
// Check PayChangu API response
const paychanguData = await paychanguResponse.json()
console.log('PayChangu API response:', paychanguData)
```

### **Debug Tools**
- **Browser Console** - Check for JavaScript errors
- **Network Tab** - Monitor API calls and responses
- **Database Logs** - Verify payment records are created
- **PayChangu Dashboard** - Check payment status in PayChangu

## 📊 Analytics & Monitoring

### **Payment Metrics**
- **Success Rate** - Percentage of successful payments
- **Average Amount** - Mean donation amount
- **Payment Methods** - Most popular payment options
- **Geographic Data** - Where payments are coming from

### **Error Tracking**
- **Failed Payments** - Reasons for payment failures
- **Iframe Issues** - Iframe loading problems
- **API Errors** - Backend error tracking
- **Message Events** - Iframe communication issues

## 🚀 Future Enhancements

### **Planned Features**
- **Recurring Payments** - Monthly supporter subscriptions
- **Payment Retry** - Automatic retry for failed payments
- **Advanced Analytics** - Detailed payment insights
- **Mobile App** - Native mobile payment experience

### **Integration Options**
- **WhatsApp Integration** - Share payment links via WhatsApp
- **SMS Notifications** - Payment confirmations via SMS
- **Email Templates** - Customized email receipts
- **Social Sharing** - Easy social media integration

## 🔄 Message Events

### **Payment Completed**
```javascript
{
  type: 'payment_completed',
  reference: 'coffee-abc123-1234567890',
  amount: 500,
  currency: 'USD'
}
```

### **Payment Failed**
```javascript
{
  type: 'payment_failed',
  reference: 'coffee-abc123-1234567890',
  reason: 'Insufficient funds'
}
```

### **Payment Cancelled**
```javascript
{
  type: 'payment_cancelled',
  reference: 'coffee-abc123-1234567890'
}
```

## 🎯 Expected Behavior

1. ✅ **User clicks donation button**
2. ✅ **API creates PayChangu checkout session**
3. ✅ **Iframe modal opens with PayChangu checkout**
4. ✅ **User completes payment in iframe**
5. ✅ **Message event triggers success handling**
6. ✅ **Success modal shows and redirects to success page**

---

*This iframe implementation provides the exact same experience as your PayChangu test project, with seamless integration into your Malawian creator platform.*
