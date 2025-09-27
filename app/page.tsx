import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SignOutButton from './components/SignOutButton'
import ProductList from './components/ProductList'



export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Mock products data - in real app, fetch from API
  const mockProducts = [
    {
      id: "1",
      title: "Complete Web Development Course",
      description: "Learn full-stack web development with React, Node.js, and MongoDB",
      price: 49.99,
      type: "zip",
      category: "software",
      seller: "John Doe",
      rating: 4.8,
      reviews: 124
    },
    {
      id: "2",
      title: "Advanced React Patterns",
      description: "Master advanced React concepts and design patterns",
      price: 29.99,
      type: "pdf",
      category: "ebooks",
      seller: "Jane Smith",
      rating: 4.9,
      reviews: 89
    },
    {
      id: "3",
      title: "JavaScript Fundamentals",
      description: "Complete guide to JavaScript from basics to advanced",
      price: 19.99,
      type: "mp4",
      category: "videos",
      seller: "Mike Johnson",
      rating: 4.7,
      reviews: 256
    }
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Digital Marketplace
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-slate-300">
            Discover and purchase high-quality digital products
          </p>
          {user ? (
            <div className="flex flex-col items-center">
              <p className="mb-4 text-slate-300">Welcome, {user.email}</p>
              <SignOutButton />
            </div>
          ) : (
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>

      <ProductList products={mockProducts} />
    </div>
  )
}
