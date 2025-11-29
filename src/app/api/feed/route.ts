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

    // Get users that current user is following
    const { data: following } = await supabaseAdmin
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = following?.map(f => f.following_id) || []
    followingIds.push(user.id) // Include own posts

    // Get posts from followed users and own posts
    // Only include posts from users with PUBLIC or FOLLOWERS_ONLY privacy
    const { data: posts, error, count } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        user:users(id, username, full_name, avatar_url, privacy)
      `, { count: 'exact' })
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Filter out posts from private users (except own posts)
    const filteredPosts = (posts || []).filter((post: any) => {
      // Always show own posts
      if (post.user_id === user.id) return true
      
      // Show public posts
      if (post.user.privacy === 'PUBLIC') return true
      
      // Show followers-only posts (since we're following them)
      if (post.user.privacy === 'FOLLOWERS_ONLY') return true
      
      // Hide private posts
      return false
    })

    return successResponse({
      posts: filteredPosts.map(transformPost),
      pagination: {
        page,
        limit,
        total: filteredPosts.length,
        totalPages: Math.ceil(filteredPosts.length / limit)
      }
    })
  } catch (error) {
    console.error('Get feed error:', error)
    return errorResponse('Internal server error', 500)
  }
})
