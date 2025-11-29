import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAdmin } from '@/lib/middleware'

export const GET = withAdmin(async (user, request: NextRequest, context: { params: Promise<{ userId: string }> }) => {
  try {
    const { userId } = await context.params
    const { data: targetUser, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !targetUser) {
      return errorResponse('User not found', 404)
    }

    return successResponse(targetUser)
  } catch (error) {
    console.error('Get user error:', error)
    return errorResponse('Internal server error', 500)
  }
})

export const DELETE = withAdmin(async (user, request: NextRequest, context: { params: Promise<{ userId: string }> }) => {
  try {
    const { userId } = await context.params
    
    // Prevent deleting admin users
    const { data: targetUser } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (targetUser?.role === 'ADMIN') {
      return errorResponse('Cannot delete admin users', 403)
    }

    // Delete user from database (cascades to posts, comments, etc.)
    await supabaseAdmin.from('users').delete().eq('id', userId)
    
    // Delete user from Supabase Auth
    await supabaseAdmin.auth.admin.deleteUser(userId)

    return successResponse({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    return errorResponse('Internal server error', 500)
  }
})
