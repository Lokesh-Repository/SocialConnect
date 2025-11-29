import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'
import { updatePostSchema } from '@/lib/validations'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response'
import { withAuth } from '@/lib/middleware'
import { transformPost } from '@/lib/transform'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    
    // Get post with user privacy info
    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        user:users(id, username, full_name, avatar_url, privacy)
      `)
      .eq('id', postId)
      .single()

    if (error || !post) {
      return errorResponse('Post not found', 404)
    }

    // Get current user
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const currentUserId = currentUser?.id || null

    // Check privacy settings
    const postUser = post.user
    
    // If post is from a public user, allow access
    if (postUser.privacy === 'PUBLIC') {
      return successResponse(transformPost(post))
    }

    // If not logged in and post is not public, deny access
    if (!currentUserId) {
      return errorResponse('This post is private', 403)
    }

    // If viewing own post, allow access
    if (post.user_id === currentUserId) {
      return successResponse(transformPost(post))
    }

    // If post is private, deny access
    if (postUser.privacy === 'PRIVATE') {
      return errorResponse('This post is private', 403)
    }

    // If post is followers-only, check if following
    if (postUser.privacy === 'FOLLOWERS_ONLY') {
      const { data: follow } = await supabaseAdmin
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', post.user_id)
        .single()

      if (!follow) {
        return errorResponse('This post is only visible to followers', 403)
      }
    }

    return successResponse(transformPost(post))
  } catch (error) {
    console.error('Get post error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export const PATCH = withAuth(async (user, request: NextRequest, context: { params: Promise<{ postId: string }> }) => {
  try {
    const { postId } = await context.params
    const body = await request.json()
    
    const validation = updatePostSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues)
    }

    const { data: post } = await supabaseAdmin
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single()

    if (!post) {
      return errorResponse('Post not found', 404)
    }

    if (post.user_id !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    const { data: updatedPost, error } = await supabaseAdmin
      .from('posts')
      .update({ content: validation.data.content })
      .eq('id', postId)
      .select(`
        *,
        user:users(id, username, full_name, avatar_url)
      `)
      .single()

    if (error) throw error

    return successResponse(transformPost(updatedPost))
  } catch (error) {
    console.error('Update post error:', error)
    return errorResponse('Internal server error', 500)
  }
})

export const DELETE = withAuth(async (user, request: NextRequest, context: { params: Promise<{ postId: string }> }) => {
  try {
    const { postId } = await context.params
    const { data: post } = await supabaseAdmin
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single()

    if (!post) {
      return errorResponse('Post not found', 404)
    }

    if (post.user_id !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    await supabaseAdmin.from('posts').delete().eq('id', postId)
    await supabaseAdmin.from('users').update({ posts_count: user.posts_count - 1 }).eq('id', user.id)

    return successResponse({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Delete post error:', error)
    return errorResponse('Internal server error', 500)
  }
})
