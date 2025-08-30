'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { useSidebarState } from '@/lib/hooks/useSidebarState'
import { useAuth } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isOpen, toggle } = useSidebarState()
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isOpen} />
      <div
        className={cn(
          'transition-all duration-300',
          isOpen ? 'ml-64' : 'ml-16'
        )}
      >
        <Topbar onToggleSidebar={toggle} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
