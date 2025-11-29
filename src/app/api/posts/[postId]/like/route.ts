import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth } from '@/lib/middleware'

export const POST = withAuth(async (user, request: NextRequest, context: { params: Promise<{ postId: string }> }) => {
  try {
    const { postId } = await context.params
    const { data: post } = await supabaseAdmin
      .from('posts')
      .select('user_id, like_count')
      .eq('id', postId)
      .single()

    if (!post) {
      return errorResponse('Post not found', 404)
    }

    const { data: existingLike } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single()

    if (existingLike) {
      return errorResponse('Already liked this post', 400)
    }

    // Create like
    await supabaseAdmin.from('likes').insert({
      user_id: user.id,
      post_id: postId
    })

    // Update like count
    await supabaseAdmin.from('posts').update({ like_count: post.like_count + 1 }).eq('id', postId)

    // Create notification
    if (post.user_id !== user.id) {
      await supabaseAdmin.from('notifications').insert({
        type: 'LIKE',
        content: `${user.username} liked your post`,
        user_id: post.user_id
      })
    }

    return successResponse({ message: 'Post liked successfully' })
  } catch (error) {
    console.error('Like post error:', error)
    return errorResponse('Internal server error', 500)
  }
})

export const DELETE = withAuth(async (user, request: NextRequest, context: { params: Promise<{ postId: string }> }) => {
  try {
    const { postId } = await context.params
    const { data: like } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single()

    if (!like) {
      return errorResponse('Like not found', 404)
    }

    // Delete like
    await supabaseAdmin.from('likes').delete().eq('user_id', user.id).eq('post_id', postId)

    // Update like count
    await supabaseAdmin.rpc('decrement_like_count', { post_id: postId })

    return successResponse({ message: 'Post unliked successfully' })
  } catch (error) {
    console.error('Unlike post error:', error)
    return errorResponse('Internal server error', 500)
  }
})
