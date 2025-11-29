import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth } from '@/lib/middleware'

export const POST = withAuth(async (user, request: NextRequest, context: { params: Promise<{ notificationId: string }> }) => {
  try {
    const { notificationId } = await context.params
    const { data: notification } = await supabaseAdmin
      .from('notifications')
      .select('user_id')
      .eq('id', notificationId)
      .single()

    if (!notification) {
      return errorResponse('Notification not found', 404)
    }

    if (notification.user_id !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    return successResponse({ message: 'Notification marked as read' })
  } catch (error) {
    console.error('Mark notification as read error:', error)
    return errorResponse('Internal server error', 500)
  }
})
