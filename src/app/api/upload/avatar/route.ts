import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@/lib/supabase-server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth } from '@/lib/middleware'

export const POST = withAuth(async (user, request: NextRequest) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return errorResponse('No file provided', 400)
    }

    // Upload to Supabase Storage
    const supabase = await createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Update user avatar
    await supabaseAdmin
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)

    return successResponse({ avatarUrl: publicUrl })
  } catch (error) {
    console.error('Upload avatar error:', error)
    return errorResponse('Internal server error', 500)
  }
})
