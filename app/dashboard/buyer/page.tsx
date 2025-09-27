"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { redirect } from "next/navigation"
import { User } from "@supabase/supabase-js"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function BuyerDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("orders")
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)

      if (!user) {
        redirect("/auth/signin")
      }
    }

    getUser()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      if (!session?.user) {
        redirect("/auth/signin")
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Redirecting...
      </div>
    )
  }

  // Chart Data
  const chartData = [
    { name: "Mon", downloads: 5, purchases: 2 },
    { name: "Tue", downloads: 8, purchases: 4 },
    { name: "Wed", downloads: 3, purchases: 1 },
    { name: "Thu", downloads: 9, purchases: 6 },
    { name: "Fri", downloads: 6, purchases: 3 },
    { name: "Sat", downloads: 12, purchases: 5 },
    { name: "Sun", downloads: 7, purchases: 2 }
  ]

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 p-6 flex flex-col">
        <h2 className="text-xl font-bold text-white mb-8">
          Digital Marketplace
        </h2>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "orders"
                ? "bg-purple-600 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            📊 Order History
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "library"
                ? "bg-purple-600 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            📚 My Library
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "bg-purple-600 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            👤 Profile
          </button>
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-slate-700 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Quick Stats</h3>
          <div className="text-slate-300 text-sm">
            <div className="flex justify-between">
              <span>Total Purchases:</span>
              <span className="text-green-400">$247.50</span>
            </div>
            <div className="flex justify-between">
              <span>Downloads:</span>
              <span className="text-blue-400">12</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
          <p className="text-slate-400">
            Welcome back, {user.user_metadata?.name || user.email}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-xl shadow-lg">
            <h3 className="text-white text-sm font-medium mb-2">Total Spent</h3>
            <p className="text-3xl font-bold text-white">$247.50</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl shadow-lg">
            <h3 className="text-white text-sm font-medium mb-2">Products Owned</h3>
            <p className="text-3xl font-bold text-white">12</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Downloads</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
              <div className="text-green-400 text-sm">+12%</div>
            </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Favorites</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
              <div className="text-blue-400 text-sm">+5</div>
            </div>
          </div>
        </div>

        {/* Chart + Active Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg lg:col-span-2">
            <h3 className="text-white font-semibold mb-4">Weekly Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="downloads"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="purchases"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Tab */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
            {activeTab === "orders" && <OrderHistoryTab />}
            {activeTab === "library" && <LibraryTab />}
            {activeTab === "profile" && <ProfileTab user={user} />}
          </div>
        </div>
      </main>
    </div>
  )
}

function OrderHistoryTab() {
  const mockOrders = [
    {
      id: "1",
      productTitle: "Complete Web Development Course",
      amount: 49.99,
      status: "PAID",
      createdAt: "2024-01-15",
      downloadCount: 2
    },
    {
      id: "2",
      productTitle: "React Advanced Patterns",
      amount: 29.99,
      status: "PENDING",
      createdAt: "2024-01-20",
      downloadCount: 0
    }
  ]

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-3">Order History</h2>
      <ul className="space-y-2 text-sm">
        {mockOrders.map((order) => (
          <li
            key={order.id}
            className="flex justify-between items-center bg-slate-600 px-3 py-2 rounded-lg"
          >
            <span className="text-white">{order.productTitle}</span>
            <span
              className={`px-2 py-1 text-xs rounded ${
                order.status === "PAID"
                  ? "bg-green-600 text-white"
                  : "bg-yellow-600 text-white"
              }`}
            >
              {order.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function LibraryTab() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-3">My Library</h2>
      <p className="text-slate-300 text-sm">Your purchased items appear here.</p>
    </div>
  )
}

function ProfileTab({ user }: { user: User }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-3">Profile</h2>
      <p className="text-slate-300 text-sm">Email: {user.email}</p>
    </div>
  )
}
