'use client'

import { useEffect } from 'react'
import { useConvexAuth, useMutation } from 'convex/react'

import { api } from '@/convex/_generated/api'

export default function ConvexAuthSync() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const initializeUser = useMutation(api.users.initializeUser)

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return
    }

    void initializeUser().catch((error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to initialize user in Convex:', error)
      }
    })
  }, [initializeUser, isAuthenticated, isLoading])

  return null
}


