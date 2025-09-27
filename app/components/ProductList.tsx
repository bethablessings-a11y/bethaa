'use client'

import { useState } from 'react'

// Define the type for a product
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  category: string;
  seller: string;
  rating: number;
  reviews: number;
}

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handlePurchase = async (productId: string) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Redirect to payment URL
        window.location.href = data.paymentUrl
      } else {
        alert(data.error || 'Purchase failed')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Purchase failed')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="ebooks">E-books</option>
            <option value="software">Software</option>
            <option value="music">Music</option>
            <option value="videos">Videos</option>
            <option value="documents">Documents</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:bg-slate-700 transition-all border border-slate-700">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white line-clamp-2">
                  {product.title}
                </h3>
                <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-lg">
                  {product.type.toUpperCase()}
                </span>
              </div>
              
              <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                {product.description}
              </p>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm text-slate-400 ml-1">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-2xl font-bold text-white">
                    ${product.price}
                  </span>
                  <p className="text-sm text-slate-400">by {product.seller}</p>
                </div>
                
                <button
                  onClick={() => handlePurchase(product.id)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
