import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAdmin } from '@/lib/middleware'

export const POST = withAdmin(async (user, request: NextRequest, context: { params: Promise<{ userId: string }> }) => {
  try {
    const { userId } = await context.params
    
    await supabaseAdmin
      .from('users')
      .update({ is_active: true })
      .eq('id', userId)

    return successResponse({ message: 'User activated successfully' })
  } catch (error) {
    console.error('Activate user error:', error)
    return errorResponse('Internal server error', 500)
  }
})
