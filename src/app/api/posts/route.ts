import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'
import { createPostSchema } from '@/lib/validations'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response'
import { withAuth } from '@/lib/middleware'
import { transformPost } from '@/lib/transform'

export const POST = withAuth(async (user, request: NextRequest) => {
  try {
    const body = await request.json()
    
    const validation = createPostSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues)
    }

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert({
        content: validation.data.content,
        image_url: validation.data.imageUrl,
        category: validation.data.category,
        user_id: user.id
      })
      .select(`
        *,
        user:users(id, username, full_name, avatar_url)
      `)
      .single()

    if (error) throw error

    // Increment user's posts count
    await supabaseAdmin
      .from('users')
      .update({ posts_count: user.posts_count + 1 })
      .eq('id', user.id)

    // Get all followers
    const { data: followers } = await supabaseAdmin
      .from('follows')
      .select('follower_id')
      .eq('following_id', user.id)

    // Create notifications for all followers
    if (followers && followers.length > 0) {
      const notifications = followers.map(f => ({
        type: 'POST',
        content: `${user.username} posted: ${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}`,
        user_id: f.follower_id,
        post_id: post.id
      }))

      await supabaseAdmin
        .from('notifications')
        .insert(notifications)
    }

    return successResponse(transformPost(post), 201)
  } catch (error) {
    console.error('Create post error:', error)
    return errorResponse('Internal server error', 500)
  }
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const userId = searchParams.get('userId')
    const offset = (page - 1) * limit

    // Get current user
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const currentUserId = currentUser?.id || null

    let query = supabaseAdmin
      .from('posts')
      .select(`
        *,
        user:users(id, username, full_name, avatar_url, privacy)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (userId) {
      query = query.eq('user_id', userId)
      
      // Check if viewing someone else's posts
      if (currentUserId !== userId) {
        // Get target user's privacy setting
        const { data: targetUser } = await supabaseAdmin
          .from('users')
          .select('privacy')
          .eq('id', userId)
          .single()

        if (targetUser) {
          // If private, don't show posts
          if (targetUser.privacy === 'PRIVATE') {
            return successResponse({
              posts: [],
              pagination: {
                page,
                limit,
                total: 0,
                totalPages: 0
              }
            })
          }

          // If followers-only, check if following
          if (targetUser.privacy === 'FOLLOWERS_ONLY' && currentUserId) {
            const { data: follow } = await supabaseAdmin
              .from('follows')
              .select('id')
              .eq('follower_id', currentUserId)
              .eq('following_id', userId)
              .single()

            if (!follow) {
              return successResponse({
                posts: [],
                pagination: {
                  page,
                  limit,
                  total: 0,
                  totalPages: 0
                }
              })
            }
          }
        }
      }
    } else {
      // For general posts feed, only show public posts if not logged in
      if (!currentUserId) {
        // This would require joining with users table to filter by privacy
        // For now, we'll fetch all and filter in memory (not ideal for production)
      }
    }

    const { data: posts, error, count } = await query

    if (error) throw error

    // Filter posts based on privacy if not viewing specific user
    let filteredPosts = posts || []
    if (!userId && currentUserId) {
      // Get list of users current user is following
      const { data: following } = await supabaseAdmin
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId)

      const followingIds = following?.map(f => f.following_id) || []

      filteredPosts = (posts || []).filter((post: any) => {
        // Always show own posts
        if (post.user_id === currentUserId) return true
        
        // Show public posts
        if (post.user.privacy === 'PUBLIC') return true
        
        // Show followers-only posts if following
        if (post.user.privacy === 'FOLLOWERS_ONLY' && followingIds.includes(post.user_id)) {
          return true
        }
        
        // Hide private posts
        return false
      })
    } else if (!userId && !currentUserId) {
      // Not logged in - only show public posts
      filteredPosts = (posts || []).filter((post: any) => post.user.privacy === 'PUBLIC')
    }

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
    console.error('Get posts error:', error)
    return errorResponse('Internal server error', 500)
  }
}
