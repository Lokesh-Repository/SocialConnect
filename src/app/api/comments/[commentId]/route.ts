import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth } from '@/lib/middleware'

export const DELETE = withAuth(async (user, request: NextRequest, context: { params: Promise<{ commentId: string }> }) => {
  try {
    const { commentId } = await context.params
    const { data: comment } = await supabaseAdmin
      .from('comments')
      .select('user_id, post_id')
      .eq('id', commentId)
      .single()

    if (!comment) {
      return errorResponse('Comment not found', 404)
    }

    if (comment.user_id !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    await supabaseAdmin.from('comments').delete().eq('id', commentId)
    await supabaseAdmin.rpc('decrement_comment_count', { post_id: comment.post_id })

    return successResponse({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Delete comment error:', error)
    return errorResponse('Internal server error', 500)
  }
})
