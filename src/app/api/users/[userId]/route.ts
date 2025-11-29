import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { transformUser } from '@/lib/transform'
import { canViewProfile } from '@/lib/privacy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    
    // Get target user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return errorResponse('User not found', 404)
    }

    // Get current user
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const currentUserId = currentUser?.id || null

    // Check if current user is following target user
    let isFollowing = false
    if (currentUserId && currentUserId !== userId) {
      const { data: follow } = await supabaseAdmin
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', userId)
        .single()
      
      isFollowing = !!follow
    }

    // Check privacy
    const canView = await canViewProfile(user, currentUserId, isFollowing)
    
    if (!canView) {
      return errorResponse('This profile is private', 403)
    }

    // Return limited info for private profiles
    const userResponse = transformUser(user)
    
    // If not following and profile is private/followers-only, hide some info
    if (!isFollowing && currentUserId !== userId && user.privacy !== 'PUBLIC') {
      return successResponse({
        ...userResponse,
        bio: null,
        postsCount: 0,
        followersCount: user.followers_count,
        followingCount: 0,
        isPrivate: true
      })
    }

    return successResponse(userResponse)
  } catch (error) {
    console.error('Get user error:', error)
    return errorResponse('Internal server error', 500)
  }
}
