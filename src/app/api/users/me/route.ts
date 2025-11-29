import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { updateProfileSchema } from '@/lib/validations'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response'
import { withAuth } from '@/lib/middleware'
import { transformUser } from '@/lib/transform'

export const GET = withAuth(async (user) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('id, email, username, full_name, bio, avatar_url, role, privacy, followers_count, following_count, posts_count, created_at, last_login')
      .eq('id', user.id)
      .single()

    if (error) throw error

    return successResponse(transformUser(profile))
  } catch (error) {
    console.error('Get profile error:', error)
    return errorResponse('Internal server error', 500)
  }
})

export const PATCH = withAuth(async (user, request: NextRequest) => {
  try {
    const body = await request.json()
    
    const validation = updateProfileSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues)
    }

    const updateData: any = {}
    if (validation.data.fullName !== undefined) updateData.full_name = validation.data.fullName
    if (validation.data.bio !== undefined) updateData.bio = validation.data.bio
    if (validation.data.privacy !== undefined) updateData.privacy = validation.data.privacy

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select('id, email, username, full_name, bio, avatar_url, privacy, followers_count, following_count, posts_count')
      .single()

    if (error) throw error

    return successResponse(transformUser(updatedUser))
  } catch (error) {
    console.error('Update profile error:', error)
    return errorResponse('Internal server error', 500)
  }
})
