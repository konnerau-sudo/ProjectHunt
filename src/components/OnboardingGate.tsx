'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { checkOnboardingStatus } from '@/lib/checkOnboardingStatus'

interface OnboardingGateProps {
  children: React.ReactNode
}

export default function OnboardingGate({ children }: OnboardingGateProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [shouldRender, setShouldRender] = useState(false)

  const checkOnboardingStatusFlow = async () => {
    const { hasProfile, user } = await checkOnboardingStatus()
    const isProtectedRoute = pathname.startsWith('/discover') || 
                           pathname.startsWith('/chats') || 
                           pathname.startsWith('/profile')
    const isOnboardingRoute = pathname === '/onboarding'

    if (!user) {
      // Not authenticated -> redirect to sign-in
      router.push('/auth/sign-in')
      setShouldRender(false)
    } else if (!hasProfile && isProtectedRoute) {
      // Not complete, trying to access protected route -> redirect to onboarding
      router.push('/onboarding')
      setShouldRender(false)
    } else if (hasProfile && isOnboardingRoute) {
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
    const timeout = setTimeout(checkOnboardingStatusFlow, 100)
    
    // Check on visibility change (to catch auth changes in other tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkOnboardingStatusFlow()
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
