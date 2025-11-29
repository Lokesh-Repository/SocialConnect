import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAdmin } from '@/lib/middleware'

export const GET = withAdmin(async () => {
  try {
    const [usersResult, activeUsersResult, postsResult, likesResult, commentsResult] = await Promise.all([
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('posts').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('likes').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('comments').select('id', { count: 'exact', head: true })
    ])

    return successResponse({
      users: {
        total: usersResult.count || 0,
        active: activeUsersResult.count || 0
      },
      posts: postsResult.count || 0,
      likes: likesResult.count || 0,
      comments: commentsResult.count || 0
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return errorResponse('Internal server error', 500)
  }
})
