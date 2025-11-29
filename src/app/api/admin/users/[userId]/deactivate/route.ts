import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAdmin } from '@/lib/middleware'

export const POST = withAdmin(async (user, request: NextRequest, context: { params: Promise<{ userId: string }> }) => {
  try {
    const { userId } = await context.params
    
    await supabaseAdmin
      .from('users')
      .update({ is_active: false })
      .eq('id', userId)

    return successResponse({ message: 'User deactivated successfully' })
  } catch (error) {
    console.error('Deactivate user error:', error)
    return errorResponse('Internal server error', 500)
  }
})
