import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSessionFromCookie } from '@/lib/cookie-utils'
import { successResponse, errorResponse } from '@/lib/api-response'

/**
 * Get current session information from cookies
 * This endpoint demonstrates how to read and decode the Supabase session cookie
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // Get the Supabase auth cookie
    const supabaseCookie = cookieStore.get('sb-opjymqknuicmialkbiv-auth-token')
    
    if (!supabaseCookie) {
      return errorResponse('No session found', 401)
    }

    // Decode the session
    const session = getSessionFromCookie(supabaseCookie.value)
    
    if (!session) {
      return errorResponse('Invalid session', 401)
    }

    // Also get custom cookies if they exist
    const accessToken = cookieStore.get('access_token')
    const refreshToken = cookieStore.get('refresh_token')
    const userInfo = cookieStore.get('user_info')

    return successResponse({
      session,
      customCookies: {
        accessToken: accessToken?.value || null,
        refreshToken: refreshToken?.value || null,
        userInfo: userInfo ? JSON.parse(userInfo.value) : null
      }
    })
  } catch (error) {
    console.error('Session error:', error)
    return errorResponse('Internal server error', 500)
  }
}
