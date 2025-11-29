import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return errorResponse(error.message, 400)
    }

    return successResponse({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return errorResponse('Internal server error', 500)
  }
}
