'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isOnboardingComplete } from '@/lib/onboarding'

interface OnboardingGateProps {
  children: React.ReactNode
}

export default function OnboardingGate({ children }: OnboardingGateProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [shouldRender, setShouldRender] = useState(false)

  const checkOnboardingStatus = () => {
    const isComplete = isOnboardingComplete()
    const isProtectedRoute = pathname.startsWith('/discover') || 
                           pathname.startsWith('/chats') || 
                           pathname.startsWith('/profile')
    const isOnboardingRoute = pathname === '/onboarding'

    if (!isComplete && isProtectedRoute) {
      // Not complete, trying to access protected route -> redirect to onboarding
      router.push('/onboarding')
      setShouldRender(false)
    } else if (isComplete && isOnboardingRoute) {
      // Complete, trying to access onboarding -> redirect to discover
      router.push('/discover')
      setShouldRender(false)
    } else {
      // All good, render children
      setShouldRender(true)
    }
    
    setIsLoading(false)
  }

  useEffect(() => {
    // Check on mount
    const timeout = setTimeout(checkOnboardingStatus, 100)
    
    // Check on visibility change (to catch localStorage changes in other tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkOnboardingStatus()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearTimeout(timeout)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return shouldRender ? <>{children}</> : null
}
