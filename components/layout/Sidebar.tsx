'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  MapPin,
  Users,
  Package,
  ShoppingCart,
  ClipboardList,
  Thermometer,
  AlertTriangle,
  Wrench,
  Settings,
  MessageCircle,
  Calendar,
  ChefHat,
  Truck,
  CheckSquare,
  UserPlus,
  Shield,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { useUserPermissions } from '@/lib/hooks/useRBAC'

const sidebarItems = [
  {
    title: 'Task',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    title: 'Shifts',
    href: '/shifts',
    icon: Calendar,
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Package,
  },
  {
    title: 'Checklist',
    href: '/haccp/checklists',
    icon: ClipboardList,
  },
  {
    title: 'Inventory',
    href: '/inventory-alt',
    icon: Package,
  },
  {
    title: 'Maintenance',
    href: '/maintenance',
    icon: Settings,
  },
  {
    title: 'Recipes & BOM',
    href: '/recipes',
    icon: ChefHat,
  },
  {
    title: 'Chat',
    href: '/chat',
    icon: MessageCircle,
  },
  {
    title: 'Staff',
    href: '/staff',
    icon: Users,
  },
]

interface SidebarProps {
  isOpen: boolean
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname()
  const { hasPermission } = useUserPermissions()
  const [settingsExpanded, setSettingsExpanded] = useState(
    pathname.startsWith('/settings')
  )

  // Check if user can access settings
  const canViewSettings = hasPermission('view_settings') || 
                         hasPermission('manage_settings') ||
                         hasPermission('view_users') ||
                         hasPermission('invite_users')

  const settingsItems = [
    {
      title: 'Users',
      href: '/settings/users',
      icon: Users,
      permission: 'view_users'
    },
    {
      title: 'Invitations',
      href: '/settings/invitations',
      icon: UserPlus,
      permission: 'invite_users'
    },
    {
      title: 'Roles',
      href: '/settings/roles',
      icon: Shield,
      permission: 'view_settings'
    },
  ]

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Main sidebar with gradient background matching mockup */}
      <div className="h-full bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-500 rounded-r-3xl shadow-xl">
        {/* Logo section */}
        <div className="flex flex-col items-center pt-8 pb-6">
          <div className="h-16 w-16 bg-black rounded-full flex items-center justify-center mb-4">
            <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-black rounded-full"></div>
            </div>
          </div>
          {isOpen && (
            <div className="text-center">
              <div className="text-black font-bold text-lg">LA PECORANEGRA</div>
              <div className="text-black/80 text-sm font-medium">Staff Manager</div>
            </div>
          )}
        </div>

        {/* Navigation items */}
        <nav className="px-4 space-y-1">
          {sidebarItems.map((item, index) => {
            const isActive = pathname === item.href || 
              (item.href === '/dashboard' && pathname === '/')
            
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-green-800 text-white shadow-lg'
                    : 'text-black hover:bg-black/10 hover:text-black'
                )}
              >
                <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                {isOpen && (
                  <span className="truncate">{item.title}</span>
                )}
              </Link>
            )
          })}

          {/* Settings Section */}
          {canViewSettings && (
            <div className="pt-2">
              <button
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className={cn(
                  'flex items-center w-full px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                  pathname.startsWith('/settings')
                    ? 'bg-green-800 text-white shadow-lg'
                    : 'text-black hover:bg-black/10 hover:text-black'
                )}
              >
                <Settings className="h-5 w-5 mr-3 flex-shrink-0" />
                {isOpen && (
                  <>
                    <span className="truncate flex-1 text-left">Settings</span>
                    {settingsExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </>
                )}
              </button>

              {/* Settings Submenu */}
              {isOpen && settingsExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {settingsItems.map((item, index) => {
                    if (!hasPermission(item.permission)) return null
                    
                    const isActive = pathname === item.href
                    
                    return (
                      <Link
                        key={index}
                        href={item.href}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                          isActive
                            ? 'bg-green-700 text-white shadow-md'
                            : 'text-black/80 hover:bg-black/10 hover:text-black'
                        )}
                      >
                        <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}
