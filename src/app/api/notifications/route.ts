import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth } from '@/lib/middleware'

export const GET = withAuth(async (user, request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const [notificationsResult, unreadResult] = await Promise.all([
      supabaseAdmin
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
      supabaseAdmin
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
    ])

    return successResponse({
      notifications: notificationsResult.data,
      unreadCount: unreadResult.count || 0,
      pagination: {
        page,
        limit,
        total: notificationsResult.count || 0,
        totalPages: Math.ceil((notificationsResult.count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return errorResponse('Internal server error', 500)
  }
})
