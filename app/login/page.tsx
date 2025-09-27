'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async () => {
    await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
    router.refresh()
  }

  const handleSignIn = async () => {
    await supabase.auth.signInWithPassword({
      email,
      password,
    })
    router.refresh()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="mb-4 p-2 border border-gray-300 rounded w-64"
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mb-4 p-2 border border-gray-300 rounded w-64"
        />
        <div className="flex space-x-2">
          <button onClick={handleSignIn} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Sign In
          </button>
          <button onClick={handleSignUp} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Sign Up
          </button>
        </div>
        <button onClick={handleSignOut} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Sign Out
        </button>
      </div>
    </div>
  )
}
