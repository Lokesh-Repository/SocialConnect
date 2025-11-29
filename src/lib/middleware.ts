import { createClient } from './supabase-server'
import { supabaseAdmin } from './supabase-admin'
import { errorResponse } from './api-response'

export async function requireAuth() {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      throw new Error('Unauthorized')
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (error || !user || !user.is_active) {
      throw new Error('Unauthorized')
    }

    return user
  } catch (error) {
    console.error('Auth error:', error)
    throw new Error('Unauthorized')
  }
}

export async function requireAdmin() {
  const user = await requireAuth()
  
  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }

  return user
}

export function withAuth(handler: (user: any, request: any, context?: any) => Promise<Response>) {
  return async (request: any, context?: any) => {
    try {
      const user = await requireAuth()
      return await handler(user, request, context)
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        return errorResponse('Unauthorized', 401)
      }
      return errorResponse(error.message || 'Internal server error', 500)
    }
  }
}

export function withAdmin(handler: (user: any, request: any, context?: any) => Promise<Response>) {
  return async (request: any, context?: any) => {
    try {
      const user = await requireAdmin()
      return await handler(user, request, context)
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        return errorResponse('Unauthorized', 401)
      }
      if (error.message.includes('Forbidden')) {
        return errorResponse('Forbidden', 403)
      }
      return errorResponse(error.message || 'Internal server error', 500)
    }
  }
}
