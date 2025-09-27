"use client"

import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="bg-slate-900 shadow-lg border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Digital Marketplace
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-slate-300 hover:text-white transition-colors"
            >
              Browse
            </Link>
            
            {loading ? (
              <div className="text-slate-400">Loading...</div>
            ) : user ? (
              <>
                {/* Authenticated User Menu */}
                <Link 
                  href="/dashboard/seller" 
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Sell
                </Link>
                
                <Link 
                  href="/dashboard/admin" 
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Admin
                </Link>
                
                <Link 
                  href="/dashboard/buyer" 
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  My Library
                </Link>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-300">
                    {user.user_metadata?.name || user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="bg-slate-700 text-slate-300 px-3 py-1 rounded-lg hover:bg-slate-600 hover:text-white transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Unauthenticated User Menu */}
                <Link 
                  href="/auth/signin" 
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-slate-300 hover:text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}