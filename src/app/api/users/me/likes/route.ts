import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth } from '@/lib/middleware'
import { transformPost } from '@/lib/transform'

export const GET = withAuth(async (user, request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Get posts that user has liked
    const { data: likes, error, count } = await supabaseAdmin
      .from('likes')
      .select(`
        post_id,
        posts (
          *,
          user:users(id, username, full_name, avatar_url)
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Extract posts from likes
    const posts = likes?.map((like: any) => like.posts).filter(Boolean) || []

    return successResponse({
      posts: posts.map(transformPost),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Get liked posts error:', error)
    return errorResponse('Internal server error', 500)
  }
})
