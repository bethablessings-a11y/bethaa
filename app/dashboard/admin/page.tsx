"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { redirect } from "next/navigation"
import { User } from "@supabase/supabase-js"

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("products")
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      
      if (!user || user.user_metadata?.role !== "ADMIN") {
        redirect("/auth/signin")
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
        
        if (!session?.user || session.user.user_metadata?.role !== "ADMIN") {
          redirect("/auth/signin")
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!user || user.user_metadata?.role !== "ADMIN") {
    return <div className="flex justify-center items-center min-h-screen">Redirecting...</div>
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-slate-800 p-6">
        <h2 className="text-xl font-bold text-white mb-8">Admin Dashboard</h2>
        
        <nav className="space-y-2">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("products")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "products" 
                  ? "bg-purple-600 text-white" 
                  : "text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              📦 Product Approval
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "users" 
                  ? "bg-purple-600 text-white" 
                  : "text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              👥 User Management
            </button>
            <button
              onClick={() => setActiveTab("payouts")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "payouts" 
                  ? "bg-purple-600 text-white" 
                  : "text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              💳 Payout Management
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "analytics" 
                  ? "bg-purple-600 text-white" 
                  : "text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              📊 Analytics
            </button>
          </div>
        </nav>

        <div className="mt-8 p-4 bg-slate-700 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Platform Stats</h3>
          <div className="text-slate-300 text-sm">
            <div className="flex justify-between">
              <span>Total Users:</span>
              <span className="text-blue-400">1,250</span>
            </div>
            <div className="flex justify-between">
              <span>Products:</span>
              <span className="text-green-400">89</span>
            </div>
            <div className="flex justify-between">
              <span>Pending:</span>
              <span className="text-yellow-400">5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Manage products, users, and payouts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl shadow-lg">
            <h3 className="text-white text-sm font-medium mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-white">1,250</p>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-xl shadow-lg">
            <h3 className="text-white text-sm font-medium mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-white">89</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Sales</p>
                <p className="text-2xl font-bold text-white">$15,670</p>
              </div>
              <div className="text-green-400 text-sm">+12%</div>
            </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending Approvals</p>
                <p className="text-2xl font-bold text-white">5</p>
              </div>
              <div className="text-yellow-400 text-sm">+2</div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800 rounded-xl shadow-lg p-6">
          {activeTab === "products" && <ProductApprovalTab />}
          {activeTab === "users" && <UserManagementTab />}
          {activeTab === "payouts" && <PayoutManagementTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
        </div>
      </div>
    </div>
  )
}

function ProductApprovalTab() {
  // TODO: Fetch pending products from API
  const mockProducts = [
    {
      id: "1",
      title: "Advanced React Course",
      seller: "John Doe",
      price: 49.99,
      type: "zip",
      status: "PENDING",
      createdAt: "2024-01-20"
    },
    {
      id: "2",
      title: "Node.js Masterclass",
      seller: "Jane Smith",
      price: 39.99,
      type: "pdf",
      status: "PENDING",
      createdAt: "2024-01-19"
    }
  ]

  const handleApprove = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/approve`, {
        method: 'POST'
      })
      if (response.ok) {
        alert("Product approved successfully")
        // TODO: Refresh the list
      } else {
        alert("Failed to approve product")
      }
    } catch (error) {
      console.error("Approval error:", error)
      alert("Approval failed")
    }
  }

  const handleReject = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/reject`, {
        method: 'POST'
      })
      if (response.ok) {
        alert("Product rejected successfully")
        // TODO: Refresh the list
      } else {
        alert("Failed to reject product")
      }
    } catch (error) {
      console.error("Rejection error:", error)
      alert("Rejection failed")
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Pending Product Approvals</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Seller
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {mockProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {product.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {product.seller}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  ${product.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {product.type.toUpperCase()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {product.createdAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleApprove(product.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(product.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UserManagementTab() {
  // TODO: Fetch users from API
  const mockUsers = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "SELLER",
      createdAt: "2024-01-15",
      status: "active"
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "BUYER",
      createdAt: "2024-01-10",
      status: "active"
    }
  ]

  const handleSuspendUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST'
      })
      if (response.ok) {
        alert("User suspended successfully")
        // TODO: Refresh the list
      } else {
        alert("Failed to suspend user")
      }
    } catch (error) {
      console.error("Suspension error:", error)
      alert("Suspension failed")
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">User Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {mockUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {user.createdAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.status === "active" 
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleSuspendUser(user.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                  >
                    Suspend
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PayoutManagementTab() {
  // TODO: Fetch payout requests from API
  const mockPayouts = [
    {
      id: "1",
      seller: "John Doe",
      amount: 150.00,
      status: "REQUESTED",
      createdAt: "2024-01-20"
    },
    {
      id: "2",
      seller: "Jane Smith",
      amount: 89.50,
      status: "APPROVED",
      createdAt: "2024-01-18"
    }
  ]

  const handleApprovePayout = async (payoutId: string) => {
    try {
      const response = await fetch(`/api/admin/payouts/${payoutId}/approve`, {
        method: 'POST'
      })
      if (response.ok) {
        alert("Payout approved successfully")
        // TODO: Refresh the list
      } else {
        alert("Failed to approve payout")
      }
    } catch (error) {
      console.error("Payout approval error:", error)
      alert("Payout approval failed")
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Payout Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Seller
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {mockPayouts.map((payout) => (
              <tr key={payout.id} className="hover:bg-slate-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {payout.seller}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  ${payout.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    payout.status === "APPROVED" 
                      ? "bg-green-600 text-white"
                      : "bg-yellow-600 text-white"
                  }`}>
                    {payout.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {payout.createdAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {payout.status === "REQUESTED" && (
                    <button
                      onClick={() => handleApprovePayout(payout.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AnalyticsTab() {
  // TODO: Fetch analytics data from API
  const mockStats = {
    totalUsers: 1250,
    totalProducts: 89,
    totalSales: 15670.50,
    pendingApprovals: 5
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Platform Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl shadow-lg">
          <h3 className="text-white text-sm font-medium mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-white">{mockStats.totalUsers}</p>
        </div>
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-xl shadow-lg">
          <h3 className="text-white text-sm font-medium mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-white">{mockStats.totalProducts}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-xl shadow-lg">
          <h3 className="text-white text-sm font-medium mb-2">Total Sales</h3>
          <p className="text-3xl font-bold text-white">${mockStats.totalSales}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-6 rounded-xl shadow-lg">
          <h3 className="text-white text-sm font-medium mb-2">Pending Approvals</h3>
          <p className="text-3xl font-bold text-white">{mockStats.pendingApprovals}</p>
        </div>
      </div>
      <div className="text-slate-400">
        Detailed analytics charts and reports will be implemented here.
      </div>
    </div>
  )
}
