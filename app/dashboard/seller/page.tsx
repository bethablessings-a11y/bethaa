"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { redirect } from "next/navigation"
import { User } from "@supabase/supabase-js"
import BuyMeCoffeeTab from "./buymecoffee"
import TestSupabase from "@/components/test-supabase" // Add this import

export default function SellerDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      
      if (!user || (user.user_metadata?.role !== "SELLER" && user.user_metadata?.role !== "ADMIN")) {
        redirect("/auth/signin")
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
        
        if (!session?.user || (session.user.user_metadata?.role !== "SELLER" && session.user.user_metadata?.role !== "ADMIN")) {
          redirect("/auth/signin")
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!user || (user.user_metadata?.role !== "SELLER" && user.user_metadata?.role !== "ADMIN")) {
    return <div className="flex justify-center items-center min-h-screen">Redirecting...</div>
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <TestSupabase /> {/* Add this line */}
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-slate-800 p-6">
        <h2 className="text-xl font-bold text-white mb-8">Seller Dashboard</h2>
        
        <nav className="space-y-2">
          <div className="space-y-1">
            <NavButton label="📊 Dashboard Home" tab="overview" activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavButton label="🎓 Courses" tab="courses" activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavButton label="💾 Digital Products" tab="digitalProducts" activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavButton label="🛠️ Services" tab="services" activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavButton label="📣 Campaigns" tab="campaigns" activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavButton label="☕ Buy Me Coffee" tab="buyMeCoffee" activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavButton label="🛒 Orders & Transactions" tab="orders" activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavButton label="👤 Profile & Settings" tab="profile" activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </nav>

        <div className="mt-8 p-4 bg-slate-700 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Quick Stats</h3>
          <div className="text-slate-300 text-sm">
            <div className="flex justify-between">
              <span>Total Sales:</span>
              <span className="text-green-400">$1,247.50</span>
            </div>
            <div className="flex justify-between">
              <span>Products:</span>
              <span className="text-blue-400">8</span>
            </div>
            <div className="flex justify-between">
              <span>Orders:</span>
              <span className="text-purple-400">24</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="bg-slate-800 rounded-xl shadow-lg p-6">
          {activeTab === "overview" && <DashboardOverviewTab />}
          {activeTab === "courses" && <CoursesTab />}
          {activeTab === "digitalProducts" && <DigitalProductsTab />}
          {activeTab === "services" && <ServicesTab />}
          {activeTab === "campaigns" && <CampaignsTab />}
          {activeTab === "buyMeCoffee" && <BuyMeCoffeeTab />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "profile" && <ProfileTab />}
        </div>
      </div>
    </div>
  )
}

function NavButton({ label, tab, activeTab, setActiveTab }: any) {
  return (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        activeTab === tab 
          ? "bg-purple-600 text-white" 
          : "text-slate-300 hover:text-white hover:bg-slate-700"
      }`}
    >
      {label}
    </button>
  )
}

function DashboardOverviewTab() {
  const recentActivity = [
    { id: 1, message: 'New course purchase by John Doe', time: '05:00 PM CAT' },
    { id: 2, message: 'Digital product downloaded by Jane Smith', time: '04:45 PM CAT' },
    { id: 3, message: 'New supporter on funding campaign', time: '04:30 PM CAT' },
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Dashboard Overview</h2>
      <div className="space-y-6">
        <div className="bg-slate-700 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-2">Sales & Engagement</h3>
          <div className="h-40 bg-slate-600 rounded flex items-center justify-center text-slate-400">
            Graph Placeholder
          </div>
        </div>
        <div className="bg-slate-700 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-2">Recent Activity</h3>
          <ul className="space-y-2">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="text-slate-300">{activity.message} - <span className="text-slate-400">{activity.time}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function CoursesTab() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Courses</h2>
      <p className="text-slate-300 mb-4">
        Create and sell your own online courses. Upload lessons, set pricing, and manage enrollments.
      </p>
      <button className="px-4 py-2 bg-purple-600 rounded-lg text-white">+ Create New Course</button>
    </div>
  )
}

function DigitalProductsTab() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Digital Products</h2>
      <p className="text-slate-300 mb-4">
        Upload and sell digital products like eBooks, templates, or downloads. Track purchases and manage your catalog.
      </p>
      <button className="px-4 py-2 bg-purple-600 rounded-lg text-white">+ Add Product</button>
    </div>
  )
}

function ServicesTab() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Services</h2>
      <p className="text-slate-300 mb-4">
        Offer freelance or professional services. Define packages, set availability, and manage bookings.
      </p>
      <button className="px-4 py-2 bg-purple-600 rounded-lg text-white">+ Add Service</button>
    </div>
  )
}

function CampaignsTab() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Campaigns</h2>
      <p className="text-slate-300 mb-4">
        Launch and manage your funding campaigns. Share your project, set funding goals, and track supporter contributions.
      </p>
      <button className="px-4 py-2 bg-purple-600 rounded-lg text-white">+ Create Campaign</button>
    </div>
  )
}

function OrdersTab() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Orders & Transactions</h2>
      <p className="text-slate-300 mb-4">
        View and manage all your sales, customer orders, and payment transactions in one place.
      </p>
      <button className="px-4 py-2 bg-purple-600 rounded-lg text-white">View Orders</button>
    </div>
  )
}

function ProfileTab() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Profile & Settings</h2>
      <p className="text-slate-300 mb-4">
        Update your profile, payment details, and customize your seller account settings.
      </p>
      <button className="px-4 py-2 bg-purple-600 rounded-lg text-white">Update Profile</button>
    </div>
  )
}