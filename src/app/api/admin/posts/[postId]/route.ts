import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAdmin } from '@/lib/middleware'

export const DELETE = withAdmin(async (user, request: NextRequest, context: { params: Promise<{ postId: string }> }) => {
  try {
    const { postId } = await context.params
    
    await supabaseAdmin.from('posts').delete().eq('id', postId)

    return successResponse({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Delete post error:', error)
    return errorResponse('Internal server error', 500)
  }
})
