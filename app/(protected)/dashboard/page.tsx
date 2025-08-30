'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp,
  CheckCircle,
  Bell,
  MessageCircle,
  Calendar,
  AlertTriangle
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {user?.user_metadata?.first_name || 'User'}!
        </p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart Card */}
        <Card className="lg:col-span-2 shadow-sm border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  CURRENT MONTH REVENUE
                </CardTitle>
                <CardDescription className="text-gray-500 text-sm">
                  AUGUST 2024
                </CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            {/* Simplified chart representation */}
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center border">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">€24,580</div>
                <div className="text-sm text-gray-500">+12% from last month</div>
                <div className="mt-4 flex items-center justify-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600">2024</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600">2023</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Due Today */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                TASKS DUE TODAY
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">Call supplier for mozzarella</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">Check flour delivery</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-4 w-4 border-2 border-gray-300 rounded"></div>
              <span className="text-sm text-gray-500">Update inventory count</span>
            </div>
          </CardContent>
        </Card>

        {/* Messages to Read */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                MESSAGES TO READ
              </CardTitle>
              <MessageCircle className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-sm text-gray-600">Andreia: "Delivery ok."</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-sm text-gray-600">Luca: "New order."</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-sm text-gray-600">Luca: "New order."</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-500">Office: "Beer promotion."</span>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium">A</span>
                </div>
                <div>
                  <div className="text-sm text-gray-700">Well, see you soon</div>
                  <div className="text-xs text-gray-500">09:12</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Reminders */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                IMPORTANT REMINDERS
              </CardTitle>
              <Bell className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-orange-600">B</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    CONTACT TECHNICIAN
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    FOR BROKEN FRIDGE
                  </div>
                  <div className="text-xs text-gray-600">
                    FOR BROKEN FRIDGE
                  </div>
                  <div className="text-xs text-gray-600">
                    PIZZA FRIDGE
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <div className="text-sm text-gray-600">, see you soon</div>
                <button className="text-xs text-blue-600 hover:underline mt-1">
                  View conversation
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Info Card */}
        <Card className="lg:col-span-2 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Welcome Back!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {user?.user_metadata?.first_name?.[0] || 'U'}
                  {user?.user_metadata?.last_name?.[0] || ''}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {user?.user_metadata?.first_name || 'User'} {user?.user_metadata?.last_name || ''}
                </h3>
                <p className="text-gray-600">{user?.email}</p>
                <Badge variant="secondary" className="mt-2">
                  {user?.user_metadata?.role || 'Staff'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
