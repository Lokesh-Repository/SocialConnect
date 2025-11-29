import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createCommentSchema } from '@/lib/validations'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response'
import { withAuth } from '@/lib/middleware'

export const POST = withAuth(async (user, request: NextRequest, context: { params: Promise<{ postId: string }> }) => {
  try {
    const { postId } = await context.params
    const body = await request.json()
    
    const validation = createCommentSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues)
    }

    const { data: post } = await supabaseAdmin
      .from('posts')
      .select('user_id, comment_count')
      .eq('id', postId)
      .single()

    if (!post) {
      return errorResponse('Post not found', 404)
    }

    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert({
        content: validation.data.content,
        user_id: user.id,
        post_id: postId
      })
      .select(`
        *,
        user:users(id, username, full_name, avatar_url)
      `)
      .single()

    if (error) throw error

    // Update comment count
    await supabaseAdmin.from('posts').update({ comment_count: post.comment_count + 1 }).eq('id', postId)

    // Create notification
    if (post.user_id !== user.id) {
      await supabaseAdmin.from('notifications').insert({
        type: 'COMMENT',
        content: `${user.username} commented on your post`,
        user_id: post.user_id
      })
    }

    return successResponse(comment, 201)
  } catch (error) {
    console.error('Create comment error:', error)
    return errorResponse('Internal server error', 500)
  }
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const { data: comments, error, count } = await supabaseAdmin
      .from('comments')
      .select(`
        *,
        user:users(id, username, full_name, avatar_url)
      `, { count: 'exact' })
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return successResponse({
      comments,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Get comments error:', error)
    return errorResponse('Internal server error', 500)
  }
}
