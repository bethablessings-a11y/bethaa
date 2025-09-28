"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface CoffeeLink {
  id: string
  user_id: string
  coffee_link: string
  created_at: string
  updated_at: string
}

interface Payment {
  id: string
  payment_reference: string
  coffee_link_id: string
  amount: number
  donor_email: string
  donor_message: string
  status: string
  created_at: string
}

export default function BuyMeCoffeeTab() {
  const [coffeeLink, setCoffeeLink] = useState<string>("")
  const [existingLink, setExistingLink] = useState<CoffeeLink | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const supabase = createClient()

  // Define fetchCoffeeLink FIRST, before useEffect
  const fetchCoffeeLink = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('❌ No user found')
      return
    }

    console.log('🔍 Fetching coffee link for user:', user.id)
    console.log('📧 User email:', user.email)
    
    const { data, error } = await supabase
      .from('coffee_links')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    console.log('📋 Fetch results:', { 
      data, 
      error,
      userMatches: user.id === 'c9422c5e-2844-48ff-9e6d-de92b01e9880'
    })

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Fetch error:', error)
      return
    }

    if (data) {
      console.log('✅ Found link:', data.coffee_link)
      setExistingLink(data)
      setCoffeeLink(data.coffee_link)
    } else {
      console.log('ℹ️ No coffee link found for current user')
      console.log('💡 User might need to generate a new link')
    }

  } catch (error: any) {
    console.error('💥 Error in fetchCoffeeLink:', error)
  }
}
  // Define fetchPayments SECOND
  const fetchPayments = async () => {
    try {
      console.log('🧨 Starting fetchPayments...')
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('👤 User auth result:', { user: !!user, userError })
      
      if (userError || !user) {
        console.log('❌ No authenticated user')
        return
      }

      // Simple test query first
      console.log('🔍 Testing basic table access')
      const { data: testData, error: testError } = await supabase
        .from('coffee_payments')
        .select('id')
        .limit(1)

      console.log('📊 Basic access test:', { testData, testError })

      if (testError) {
        console.log('🚨 Table might not exist or RLS is blocking')
        return
      }

      // Get user's coffee links
      console.log('🔍 Getting user coffee links')
      const { data: userLinks, error: linksError } = await supabase
        .from('coffee_links')
        .select('coffee_link')
        .eq('user_id', user.id)

      console.log('📋 User coffee links:', { userLinks, linksError })

      if (linksError || !userLinks || userLinks.length === 0) {
        console.log('ℹ️ No coffee links found for user')
        setPayments([])
        return
      }

      const coffeeLinkIds = userLinks.map(link => link.coffee_link)
      console.log('🎯 Coffee link IDs to search:', coffeeLinkIds)

      // Fetch payments for these coffee links
      console.log('🔍 Fetching payments')
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('coffee_payments')
        .select('*')
        .in('coffee_link_id', coffeeLinkIds)
        .order('created_at', { ascending: false })
        .limit(10)

      console.log('💳 Payments query result:', { 
        data: paymentsData, 
        error: paymentsError,
        count: paymentsData?.length 
      })

      if (paymentsError) {
        console.error('❌ Payments query error')
        return
      }

      setPayments(paymentsData || [])
      console.log('✅ Payments loaded successfully:', paymentsData?.length || 0)

    } catch (error) {
      console.error('💥 Unexpected error in fetchPayments:', error)
    }
  }

  // NOW use useEffect AFTER functions are defined
  useEffect(() => {
    fetchCoffeeLink()
  }, [])

 // Add this useEffect to log the current state
useEffect(() => {
  console.log('🔄 Component state updated:')
  console.log('📝 Coffee Link:', coffeeLink)
  console.log('🗂️ Existing Link:', existingLink)
  console.log('🔗 Full URL:', coffeeLink ? `${window.location.origin}/coffee/${coffeeLink}` : 'No link')
}, [coffeeLink, existingLink])

  const generateUniqueLink = (): string => {
    return `coffee-${Math.random().toString(36).substring(2, 10)}`
  }

  const getFullCoffeeLink = () => {
    if (!coffeeLink) return ""
    return `${window.location.origin}/coffee/${coffeeLink}`
  }

  const handleGenerateLink = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setMessage({ type: 'error', text: 'Please log in first' })
        setLoading(false)
        return
      }

      const newLink = generateUniqueLink()
      setDebugInfo(`Generating link for user: ${user.id.substring(0, 8)}...`)

      let result

      if (existingLink) {
        // Update existing coffee link
        result = await supabase
          .from('coffee_links')
          .update({ 
            coffee_link: newLink,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingLink.id)
          .select()
      } else {
        // Check if user already has a coffee link (handle unique constraint)
        const { data: existingUserLink } = await supabase
          .from('coffee_links')
          .select('id, coffee_link')
          .eq('user_id', user.id)
          .maybeSingle()

        if (existingUserLink) {
          // Update existing user's coffee link
          result = await supabase
            .from('coffee_links')
            .update({ 
              coffee_link: newLink,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingUserLink.id)
            .select()
        } else {
          // Create new coffee link
          result = await supabase
            .from('coffee_links')
            .insert({
              user_id: user.id,
              coffee_link: newLink,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
        }
      }

      if (result.error) {
        setDebugInfo(`Error: ${result.error.code} - ${result.error.message}`)
        setMessage({ type: 'error', text: `Error: ${result.error.message}` })
      } else {
        setCoffeeLink(newLink)
        setMessage({ type: 'success', text: 'Coffee link generated successfully!' })
        setDebugInfo('✅ Link created successfully!')
        await fetchCoffeeLink()
      }

    } catch (error: any) {
      console.error("Unexpected error:", error)
      setDebugInfo(`Unexpected error: ${error.message}`)
      setMessage({ type: 'error', text: 'Unexpected error occurred' })
    }

    setLoading(false)
  }

  const copyToClipboard = async () => {
    if (!coffeeLink) return
    
    try {
      await navigator.clipboard.writeText(getFullCoffeeLink())
      setMessage({ type: 'success', text: 'Link copied to clipboard!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to copy link' })
    }
  }

  const shareOnSocialMedia = (platform: string) => {
    const text = `Support my work by buying me a coffee! ☕ ${getFullCoffeeLink()}`
    const url = getFullCoffeeLink()
    
    let shareUrl = ""
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
        break
      default:
        return
    }
    
    window.open(shareUrl, "_blank", "width=600,height=400")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Add a manual test button for debugging
  const testDatabaseAccess = async () => {
    console.log('🧪 Manual database test...')
    
    // Test coffee_links
    const { data: links, error: linksError } = await supabase
      .from('coffee_links')
      .select('*')
      .limit(2)
    console.log('Coffee links test:', { links, linksError })
    
    // Test coffee_payments
    const { data: payments, error: paymentsError } = await supabase
      .from('coffee_payments')
      .select('*')
      .limit(2)
    console.log('Coffee payments test:', { payments, paymentsError })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white mb-6">Buy Me Coffee</h2>
      
      <div className="bg-slate-700 p-6 rounded-lg">
        <p className="text-slate-300 mb-6">
          Generate a personalized donation link so supporters can buy you a coffee (or two ☕) to support your work.
        </p>

        {/* Success Message with Instructions */}
        {coffeeLink && (
          <div className="bg-green-600 text-white p-4 rounded-lg mb-6">
            <div className="font-semibold flex items-center">
              <span className="text-lg mr-2">✅</span>
              Coffee Link Created Successfully!
            </div>
            <div className="text-sm mt-2">
              Share this link with your supporters: 
              <a 
                href={getFullCoffeeLink()} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline ml-1 hover:text-green-200"
              >
                {getFullCoffeeLink()}
              </a>
            </div>
          </div>
        )}

        {/* Error Message */}
        {message && message.type === 'error' && (
          <div className="bg-red-600 text-white p-3 rounded-lg mb-4">
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          {coffeeLink ? (
            <div className="space-y-6">
              {/* Link Display and Copy */}
              <div>
                <label className="block text-slate-300 text-sm mb-2">Your Coffee Link:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={getFullCoffeeLink()}
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <span>📋</span>
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Quick Share Buttons */}
              <div>
                <label className="block text-slate-300 text-sm mb-2">Quick Share:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => shareOnSocialMedia('twitter')}
                    className="px-3 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>🐦</span>
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() => shareOnSocialMedia('facebook')}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>📘</span>
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => shareOnSocialMedia('linkedin')}
                    className="px-3 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>💼</span>
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={() => shareOnSocialMedia('whatsapp')}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>💬</span>
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                    <a
  href={getFullCoffeeLink()}
  target="_blank"
  rel="noopener noreferrer"
  onClick={(e) => {
    console.log('🧪 Testing link click:')
    console.log('🔗 Link being tested:', getFullCoffeeLink())
    console.log('📝 Coffee link value:', coffeeLink)
    console.log('👤 Current user link should be:', 'coffee-4hzjurz0') // From your database
    console.log('💾 Database has links:', ['test-coffee-123', 'coffee-4hzjurz0']) // From your JSON
    
    // Check if the link matches what's in database
    if (coffeeLink !== 'coffee-4hzjurz0') {
      console.warn('⚠️ LINK MISMATCH: Current link does not match database!')
      console.warn('Expected: coffee-4hzjurz0')
      console.warn('Actual:', coffeeLink)
    }
  }}
  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
>
  <span>🔗</span>
  <span>Test Your Link</span>
</a>
                <button
                  onClick={handleGenerateLink}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>🔄</span>
                  <span>{loading ? 'Generating...' : 'Generate New Link'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={handleGenerateLink}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all transform hover:scale-105 font-medium text-lg flex items-center justify-center space-x-2 mx-auto"
              >
                <span className="text-2xl">☕</span>
                <span>{loading ? 'Generating Your Coffee Link...' : 'Generate Coffee Link'}</span>
              </button>
              <p className="text-slate-400 text-sm mt-3">
                Create your personalized donation link in seconds
              </p>
            </div>
          )}
        </div>

        {/* Payments Section */}
        {payments.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Donations</h3>
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="bg-slate-600 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">
                        {formatCurrency(payment.amount)}
                      </div>
                      <div className="text-slate-300 text-sm">
                        From: {payment.donor_email}
                      </div>
                      {payment.donor_message && (
                        <div className="text-slate-400 text-xs mt-1">
                          "{payment.donor_message}"
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        payment.status === 'completed' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-yellow-500 text-black'
                      }`}>
                        {payment.status}
                      </div>
                      <div className="text-slate-400 text-xs mt-1">
                        {formatDate(payment.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {payments.length > 5 && (
              <div className="text-center mt-3">
                <button className="text-slate-400 text-sm hover:text-white">
                  View all {payments.length} donations
                </button>
              </div>
            )}
          </div>
        )}

        {/* Debug test buttons */}
        <div className="mt-4 text-center space-x-2">
          <button
            onClick={testDatabaseAccess}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm"
          >
            Test Database Connection
          </button>
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/test-payment')
                const data = await response.json()
                console.log('🧪 API Test Result:', data)
                alert(`API Test: ${data.status}\nDatabase: ${JSON.stringify(data.database)}`)
              } catch (error) {
                console.error('API Test Error:', error)
                alert('API Test Failed')
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            Test API Endpoint
          </button>
        </div>

        {/* Analytics Section */}
        {payments.length > 0 && (
          <div className="mt-8 bg-slate-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">📊 Coffee Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-600 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(payments.reduce((sum, p) => sum + Number(p.amount), 0))}
                </div>
                <div className="text-slate-300 text-sm">Total Raised</div>
              </div>
              <div className="bg-slate-600 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">{payments.length}</div>
                <div className="text-slate-300 text-sm">Total Donations</div>
              </div>
              <div className="bg-slate-600 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {formatCurrency(payments.reduce((sum, p) => sum + Number(p.amount), 0) / payments.length || 0)}
                </div>
                <div className="text-slate-300 text-sm">Avg Donation</div>
              </div>
              <div className="bg-slate-600 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {payments.filter(p => p.status === 'completed').length}
                </div>
                <div className="text-slate-300 text-sm">Completed</div>
              </div>
            </div>
          </div>
        )}

        {/* Customization Options */}
        {coffeeLink && (
          <div className="mt-6 bg-slate-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">🎨 Customize Your Coffee Page</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">Page Title</label>
                <input
                  type="text"
                  placeholder="e.g., Support My Creative Work"
                  className="w-full p-3 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Description</label>
                <textarea
                  placeholder="Tell your supporters what you're working on and how their support helps..."
                  className="w-full p-3 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-purple-500 focus:outline-none resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Funding Goal (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g., 1000"
                  className="w-full p-3 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Save Customization
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-slate-600 rounded-lg">
          <h3 className="text-white font-semibold mb-3">How it works:</h3>
          <ul className="text-slate-300 text-sm space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-green-400">✓</span>
              <span>Generate your unique coffee link</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400">✓</span>
              <span>Share it on your social media, website, or with your audience</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400">✓</span>
              <span>Supporters can use this link to send you donations</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400">✓</span>
              <span>You can regenerate the link anytime for security</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400">✓</span>
              <span>Supports Malawian payment methods (Airtel Money, TNM Mpamba)</span>
            </li>
          </ul>
        </div>

        {/* Debug info */}
        <div className="mt-4 p-3 bg-slate-800 rounded">
          <div className="text-slate-400 text-sm font-mono">
            <div>Debug: {debugInfo}</div>
            <div>Current Link: {coffeeLink || 'None'}</div>
            <div>Payments: {payments.length} found</div>
          </div>
        </div>
      </div>
    </div>
  )
}