/**
 * Decode the Supabase session cookie
 * The cookie is base64 encoded JSON containing session data
 */
export function decodeSupabaseCookie(cookieValue: string): any {
  try {
    // Remove 'base64-' prefix if present
    const base64String = cookieValue.replace(/^base64-/, '')
    
    // Decode base64 to string
    const decodedString = Buffer.from(base64String, 'base64').toString('utf-8')
    
    // Parse JSON
    const sessionData = JSON.parse(decodedString)
    
    return sessionData
  } catch (error) {
    console.error('Failed to decode Supabase cookie:', error)
    return null
  }
}

/**
 * Extract specific data from Supabase session cookie
 */
export function getSessionFromCookie(cookieValue: string) {
  const sessionData = decodeSupabaseCookie(cookieValue)
  
  if (!sessionData) return null
  
  return {
    accessToken: sessionData.access_token,
    refreshToken: sessionData.refresh_token,
    expiresIn: sessionData.expires_in,
    expiresAt: sessionData.expires_at,
    tokenType: sessionData.token_type,
    user: sessionData.user
  }
}

/**
 * Check if session is expired
 */
export function isSessionExpired(expiresAt: number): boolean {
  return Date.now() / 1000 > expiresAt
}

/**
 * Get user info from session cookie
 */
export function getUserFromCookie(cookieValue: string) {
  const sessionData = decodeSupabaseCookie(cookieValue)
  return sessionData?.user || null
}
